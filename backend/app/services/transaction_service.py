import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.models import Transaction, RiskAssessment, AgentResult, PaymentEvent, User
from app.schemas.transaction import InsightsResponse, CategorySpend, MonthlySpend

class TransactionService:
    @staticmethod
    def get_historical_profile(db: Session) -> Dict[str, Any]:
        """
        Calculates baseline spending statistics from the database for the AI agents.
        """
        all_txs = db.query(Transaction).filter(Transaction.payment_status != "CANCELLED").all()
        if not all_txs:
            return {
                "historical_user_avg": 85.0,
                "category_stats": {"Food": 45.0, "Shopping": 120.0, "Travel": 350.0, "Bills": 95.0, "Education": 110.0, "Entertainment": 18.0, "Services": 55.0},
                "recent_transactions": []
            }

        total_amount = sum(tx.amount for tx in all_txs)
        avg_amount = round(total_amount / len(all_txs), 2)

        # Category stats
        category_sums: Dict[str, float] = {}
        category_counts: Dict[str, int] = {}
        for tx in all_txs:
            category_sums[tx.category] = category_sums.get(tx.category, 0.0) + tx.amount
            category_counts[tx.category] = category_counts.get(tx.category, 0) + 1

        category_stats = {
            cat: round(category_sums[cat] / category_counts[cat], 2)
            for cat in category_sums
        }

        # Recent transactions for duplicate checking (last 10 settled transactions)
        recent_txs = (
            db.query(Transaction)
            .filter(Transaction.payment_status != "PENDING")
            .order_by(desc(Transaction.created_at))
            .limit(10)
            .all()
        )
        recent_list = [
            {"id": tx.id, "merchant": tx.merchant, "amount": tx.amount, "category": tx.category, "created_at": tx.created_at.isoformat()}
            for tx in recent_txs
        ]

        return {
            "historical_user_avg": avg_amount,
            "category_stats": category_stats,
            "recent_transactions": recent_list
        }

    @staticmethod
    def create_pending_transaction(db: Session, data: Dict[str, Any]) -> Transaction:
        """
        Creates an initial pending transaction record before AI analysis.
        """
        user = db.query(User).first()
        user_id = user.id if user else None

        tx = Transaction(
            user_id=user_id,
            merchant=data["merchant"],
            merchant_email=data.get("merchant_email"),
            amount=data["amount"],
            currency=data.get("currency", "USD"),
            category=data.get("category", "Other"),
            description=data.get("description", ""),
            purpose=data.get("purpose", ""),
            notes=data.get("notes", ""),
            payment_status="PENDING",
            mode="DEMO"
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    @staticmethod
    def save_analysis_results(
        db: Session,
        transaction_id: str,
        pipeline_result: Any
    ):
        """
        Persists the multi-agent results and risk assessment to the database.
        """
        tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not tx:
            return

        tx.risk_score = pipeline_result.risk_score
        tx.risk_level = pipeline_result.risk_level
        tx.ai_recommendation = pipeline_result.recommendation
        
        # Save RiskAssessment
        assessment = RiskAssessment(
            transaction_id=tx.id,
            risk_score=pipeline_result.risk_score,
            risk_level=pipeline_result.risk_level,
            recommendation=pipeline_result.recommendation,
            confidence=pipeline_result.confidence,
            reasons_json=json.dumps(pipeline_result.reasons)
        )
        db.add(assessment)

        # Save Agent results
        for step in pipeline_result.steps:
            agent_res = AgentResult(
                transaction_id=tx.id,
                agent_name=step.agent_name,
                status=step.status,
                output_data_json=json.dumps(step.output),
                execution_time_ms=step.execution_time_ms
            )
            db.add(agent_res)

        # Add event
        event = PaymentEvent(
            transaction_id=tx.id,
            event_type="ANALYZED",
            payload_json=json.dumps({"risk_score": tx.risk_score, "recommendation": tx.ai_recommendation})
        )
        db.add(event)

        db.commit()

    @staticmethod
    def get_insights(db: Session) -> InsightsResponse:
        """
        Generates analytics and charts data for the AI Insights dashboard.
        """
        txs = db.query(Transaction).all()
        total_txs = len(txs)
        
        if total_txs == 0:
            return InsightsResponse(
                total_transactions=0,
                total_spent=0.0,
                avg_transaction_amount=0.0,
                high_risk_count=0,
                medium_risk_count=0,
                low_risk_count=0,
                category_spending=[],
                monthly_spending=[],
                key_insights=["No transactions recorded yet. Create your first payment to generate AI insights."],
                unusual_transactions=[]
            )

        completed_txs = [t for t in txs if t.payment_status == "COMPLETED"]
        total_spent = sum(t.amount for t in completed_txs)
        avg_spent = round(total_spent / len(completed_txs), 2) if completed_txs else 0.0

        high_risk = sum(1 for t in txs if t.risk_level == "HIGH")
        med_risk = sum(1 for t in txs if t.risk_level == "MEDIUM")
        low_risk = sum(1 for t in txs if t.risk_level == "LOW")

        # Category spending
        cat_map: Dict[str, Dict[str, Any]] = {}
        for t in completed_txs:
            if t.category not in cat_map:
                cat_map[t.category] = {"total": 0.0, "count": 0}
            cat_map[t.category]["total"] += t.amount
            cat_map[t.category]["count"] += 1

        category_spending = [
            CategorySpend(
                category=cat,
                total_amount=round(info["total"], 2),
                transaction_count=info["count"],
                percentage=round((info["total"] / total_spent * 100), 1) if total_spent > 0 else 0.0
            )
            for cat, info in cat_map.items()
        ]
        # Sort by total amount descending
        category_spending.sort(key=lambda x: x.total_amount, reverse=True)

        # Monthly spending
        monthly_map: Dict[str, Dict[str, Any]] = {}
        for t in completed_txs:
            month_key = t.created_at.strftime("%b %Y")
            if month_key not in monthly_map:
                monthly_map[month_key] = {"total": 0.0, "count": 0}
            monthly_map[month_key]["total"] += t.amount
            monthly_map[month_key]["count"] += 1

        monthly_spending = [
            MonthlySpend(
                month=m,
                total_amount=round(data["total"], 2),
                count=data["count"]
            )
            for m, data in monthly_map.items()
        ]

        # Key dynamic insights
        key_insights = [
            f"Your average completed transaction is ${avg_spent:,.2f}.",
            f"{low_risk} out of {total_txs} transactions were assessed as low risk by PayPilot AI.",
        ]
        if high_risk > 0:
            key_insights.append(f"PayPilot flagged {high_risk} high-risk transaction(s) requiring review or cancellation.")
        if category_spending:
            top_cat = category_spending[0]
            key_insights.append(f"Highest spending category is {top_cat.category} (${top_cat.total_amount:,.2f}, {top_cat.percentage}% of total).")

        unusual = [t for t in txs if t.risk_level in ["HIGH", "MEDIUM"]][:5]

        return InsightsResponse(
            total_transactions=total_txs,
            total_spent=round(total_spent, 2),
            avg_transaction_amount=avg_spent,
            high_risk_count=high_risk,
            medium_risk_count=med_risk,
            low_risk_count=low_risk,
            category_spending=category_spending,
            monthly_spending=monthly_spending,
            key_insights=key_insights,
            unusual_transactions=unusual
        )

transaction_service = TransactionService()
