import time
import logging
from typing import Dict, Any, List
from app.agents.transaction_agent import transaction_agent
from app.agents.risk_agent import risk_agent
from app.agents.fraud_agent import fraud_agent
from app.agents.spending_agent import spending_agent
from app.agents.recommendation_agent import recommendation_agent
from app.agents.explainability_agent import explainability_agent
from app.schemas.agents import (
    AgentPipelineResponse,
    AgentStepResult,
    TransactionUnderstandingOutput,
    RiskAnalysisOutput,
    FraudSignalOutput,
    SpendingInsightOutput,
    RecommendationOutput,
    ExplainabilityOutput,
    ExplainabilityFactor
)

logger = logging.getLogger(__name__)

class MultiAgentOrchestrator:
    """
    PayPilot Multi-Agent Payment Intelligence Engine Orchestrator
    Coordinates specialized agents through a structured pipeline:
    Transaction Understanding -> Risk Analysis -> Fraud Signals -> Spending Insights -> Recommendation -> Explainability
    """

    async def run_pipeline(
        self,
        transaction_id: str,
        payment_data: Dict[str, Any],
        historical_user_avg: float = 85.0,
        category_stats: Dict[str, float] = None,
        recent_transactions: List[Dict[str, Any]] = None
    ) -> AgentPipelineResponse:
        steps: List[AgentStepResult] = []
        context = {
            "transaction_id": transaction_id,
            "amount": payment_data.get("amount", 0.0),
            "currency": payment_data.get("currency", "USD"),
            "merchant": payment_data.get("merchant", ""),
            "merchant_email": payment_data.get("merchant_email", ""),
            "category": payment_data.get("category", "Other"),
            "description": payment_data.get("description", ""),
            "purpose": payment_data.get("purpose", ""),
            "notes": payment_data.get("notes", ""),
            "historical_user_avg": historical_user_avg,
            "category_stats": category_stats or {},
            "recent_transactions": recent_transactions or []
        }

        try:
            # 1. Transaction Understanding Agent
            t0 = time.time()
            understanding_out: TransactionUnderstandingOutput = await transaction_agent.process(context)
            t1 = time.time()
            steps.append(AgentStepResult(
                agent_id="agent-understanding",
                agent_name=understanding_out.agent_name,
                role_description=transaction_agent.role,
                status=understanding_out.status,
                execution_time_ms=round((t1 - t0) * 1000, 1),
                output=understanding_out.model_dump()
            ))
            context["understanding_output"] = understanding_out.model_dump()

            # 2. Risk Analysis Agent
            t0 = time.time()
            risk_out: RiskAnalysisOutput = await risk_agent.process(context)
            t1 = time.time()
            steps.append(AgentStepResult(
                agent_id="agent-risk",
                agent_name=risk_out.agent_name,
                role_description=risk_agent.role,
                status=risk_out.status,
                execution_time_ms=round((t1 - t0) * 1000, 1),
                output=risk_out.model_dump()
            ))
            context["risk_output"] = risk_out.model_dump()

            # 3. Fraud Signal Agent
            t0 = time.time()
            fraud_out: FraudSignalOutput = await fraud_agent.process(context)
            t1 = time.time()
            steps.append(AgentStepResult(
                agent_id="agent-fraud",
                agent_name=fraud_out.agent_name,
                role_description=fraud_agent.role,
                status=fraud_out.status,
                execution_time_ms=round((t1 - t0) * 1000, 1),
                output=fraud_out.model_dump()
            ))
            context["fraud_output"] = fraud_out.model_dump()

            # 4. Spending Insight Agent
            t0 = time.time()
            spending_out: SpendingInsightOutput = await spending_agent.process(context)
            t1 = time.time()
            steps.append(AgentStepResult(
                agent_id="agent-spending",
                agent_name=spending_out.agent_name,
                role_description=spending_agent.role,
                status=spending_out.status,
                execution_time_ms=round((t1 - t0) * 1000, 1),
                output=spending_out.model_dump()
            ))
            context["spending_output"] = spending_out.model_dump()

            # 5. Recommendation Agent
            t0 = time.time()
            recommendation_out: RecommendationOutput = await recommendation_agent.process(context)
            t1 = time.time()
            steps.append(AgentStepResult(
                agent_id="agent-recommendation",
                agent_name=recommendation_out.agent_name,
                role_description=recommendation_agent.role,
                status=recommendation_out.status,
                execution_time_ms=round((t1 - t0) * 1000, 1),
                output=recommendation_out.model_dump()
            ))
            context["recommendation_output"] = recommendation_out.model_dump()

            # 6. Explainability Agent
            t0 = time.time()
            explainability_out: ExplainabilityOutput = await explainability_agent.process(context)
            t1 = time.time()
            steps.append(AgentStepResult(
                agent_id="agent-explainability",
                agent_name=explainability_out.agent_name,
                role_description=explainability_agent.role,
                status=explainability_out.status,
                execution_time_ms=round((t1 - t0) * 1000, 1),
                output=explainability_out.model_dump()
            ))

            return AgentPipelineResponse(
                transaction_id=transaction_id,
                risk_score=risk_out.risk_score,
                risk_level=risk_out.risk_level,
                recommendation=recommendation_out.recommendation,
                confidence=recommendation_out.confidence,
                reasons=recommendation_out.primary_reasons,
                steps=steps,
                understanding=understanding_out,
                risk_analysis=risk_out,
                fraud_signals=fraud_out,
                spending_insights=spending_out,
                recommendation_detail=recommendation_out,
                explainability=explainability_out
            )

        except Exception as e:
            logger.error(f"Error executing agent pipeline: {e}", exc_info=True)
            # Safe Fallback as mandated by security requirements
            fallback_understanding = TransactionUnderstandingOutput(
                agent_name="Transaction Understanding Agent",
                detected_intent=f"Payment to {context.get('merchant', 'Merchant')}",
                category_match=True,
                urgency_detected=False,
                unusual_characteristics=[],
                structured_summary={"status": "manual_review_required"},
                status="WARNING"
            )
            fallback_risk = RiskAnalysisOutput(
                agent_name="Risk Analysis Agent",
                risk_score=50,
                risk_level="MEDIUM",
                risk_factors=["AI automated analysis encountered a temporary service limitation. Please review manually."],
                timing_risk="NORMAL",
                amount_risk="NORMAL",
                status="WARNING"
            )
            fallback_fraud = FraudSignalOutput(
                agent_name="Fraud Signal Agent",
                fraud_signals=[],
                overall_fraud_severity="LOW",
                status="SUCCESS"
            )
            fallback_spending = SpendingInsightOutput(
                agent_name="Spending Insight Agent",
                user_historical_avg=historical_user_avg,
                category_historical_avg=historical_user_avg,
                current_vs_avg_percentage=0.0,
                monthly_budget_impact="Analysis unavailable",
                spending_trend="STEADY",
                spending_insight="Historical comparison unavailable during offline review mode.",
                status="WARNING"
            )
            fallback_rec = RecommendationOutput(
                agent_name="Recommendation Agent",
                recommendation="REVIEW RECOMMENDED",
                recommendation_code="REVIEW",
                confidence=0.75,
                primary_reasons=["AI analysis is temporarily unavailable. Please review the payment details manually."],
                actions_to_consider=["Review recipient information and invoice details carefully."],
                status="WARNING"
            )
            fallback_explain = ExplainabilityOutput(
                agent_name="Explainability Agent",
                human_summary="AI analysis is temporarily unavailable. Please review the payment details manually.",
                why_see_this=["System fallback mode was engaged."],
                breakdown_factors=[
                    ExplainabilityFactor(
                        title="System Notice",
                        badge="CAUTION",
                        detail="Automated scoring is running in manual-review fallback mode."
                    )
                ],
                status="WARNING"
            )

            return AgentPipelineResponse(
                transaction_id=transaction_id,
                risk_score=50,
                risk_level="MEDIUM",
                recommendation="REVIEW RECOMMENDED",
                confidence=0.70,
                reasons=["AI analysis is temporarily unavailable. Please review the payment details manually."],
                steps=[],
                understanding=fallback_understanding,
                risk_analysis=fallback_risk,
                fraud_signals=fallback_fraud,
                spending_insights=fallback_spending,
                recommendation_detail=fallback_rec,
                explainability=fallback_explain
            )

orchestrator = MultiAgentOrchestrator()
