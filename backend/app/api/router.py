import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.database.models import Transaction, RiskAssessment, AgentResult, PaymentEvent
from app.schemas.transaction import (
    PaymentAnalyzeRequest,
    PaymentCreateOrderRequest,
    PaymentCaptureOrderRequest,
    TransactionResponse,
    TransactionsListResponse,
    InsightsResponse,
    SystemStatusResponse,
    AgentStatusInfo
)
from app.schemas.agents import AgentPipelineResponse
from app.agents.orchestrator import orchestrator
from app.services.paypal_service import paypal_service
from app.services.transaction_service import transaction_service
from app.services.seed_data import seed_database
from app.core.config import settings

api_router = APIRouter()

@api_router.get("/health", tags=["System"])
async def health_check():
    """System health check and mode indicator."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "paypal_mode": "PAYPAL_SANDBOX" if settings.is_paypal_configured else "DEMO_MODE",
        "ai_engine": "GEMINI_API" if settings.is_gemini_configured else "AUTONOMOUS_HEURISTIC_ENGINE",
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.get("/agents/status", response_model=SystemStatusResponse, tags=["Agents"])
async def get_agents_status():
    """Returns the operational status of all 6 PayPilot specialized AI agents."""
    agents = [
        AgentStatusInfo(
            agent_id="agent-understanding",
            name="Transaction Understanding Agent",
            role="Context extraction, category validation & urgency detection",
            status="ACTIVE",
            model="Gemini 1.5 Flash / Contextual Engine" if settings.is_gemini_configured else "Contextual Semantic Engine",
            last_active="Ready"
        ),
        AgentStatusInfo(
            agent_id="agent-risk",
            name="Risk Analysis Agent",
            role="Multi-factor risk scoring (0-100) & timing analysis",
            status="ACTIVE",
            model="Gemini 1.5 Flash / Baseline Engine" if settings.is_gemini_configured else "Statistical Scoring Model",
            last_active="Ready"
        ),
        AgentStatusInfo(
            agent_id="agent-fraud",
            name="Fraud Signal Agent",
            role="Duplicate transaction detection & velocity spike checks",
            status="ACTIVE",
            model="Synthetic Pattern Matcher",
            last_active="Ready"
        ),
        AgentStatusInfo(
            agent_id="agent-spending",
            name="Spending Insight Agent",
            role="Historical benchmark comparison & budget impact",
            status="ACTIVE",
            model="Financial Statistical Benchmarker",
            last_active="Ready"
        ),
        AgentStatusInfo(
            agent_id="agent-recommendation",
            name="Recommendation Agent",
            role="Informational decision synthesis & actionable steps",
            status="ACTIVE",
            model="Synthesis Decision Matrix",
            last_active="Ready"
        ),
        AgentStatusInfo(
            agent_id="agent-explainability",
            name="Explainability Agent",
            role="Plain language factor translation ('Why am I seeing this?')",
            status="ACTIVE",
            model="Explainable Natural Language Layer",
            last_active="Ready"
        )
    ]
    return SystemStatusResponse(
        paypal_mode="PAYPAL_SANDBOX" if settings.is_paypal_configured else "DEMO_MODE",
        ai_provider="GEMINI_API" if settings.is_gemini_configured else "AUTONOMOUS_HEURISTIC_ENGINE",
        database_status="CONNECTED",
        agents=agents
    )

@api_router.post("/payment/analyze", response_model=AgentPipelineResponse, tags=["Payment Analysis"])
async def analyze_payment(
    request: PaymentAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Submits a payment request to the PayPilot Multi-Agent Intelligence Engine.
    Executes the 6-agent pipeline and returns structured risk, recommendations, and explanations.
    """
    # 1. Create a pending transaction record
    tx = transaction_service.create_pending_transaction(db, request.model_dump())

    # 2. Retrieve user baseline statistics for agents
    profile = transaction_service.get_historical_profile(db)

    # 3. Execute the 6 specialized AI agents pipeline
    pipeline_result = await orchestrator.run_pipeline(
        transaction_id=tx.id,
        payment_data=request.model_dump(),
        historical_user_avg=profile["historical_user_avg"],
        category_stats=profile["category_stats"],
        recent_transactions=profile["recent_transactions"]
    )

    # 4. Save results to database
    transaction_service.save_analysis_results(db, tx.id, pipeline_result)

    return pipeline_result

@api_router.post("/payment/create-order", tags=["Payments"])
async def create_payment_order(
    request: PaymentCreateOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Creates a PayPal Sandbox Order (or Mock order in Demo Mode).
    """
    tx = db.query(Transaction).filter(Transaction.id == request.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    order_result = await paypal_service.create_order(
        amount=tx.amount,
        currency=tx.currency,
        merchant=tx.merchant,
        description=tx.description or f"Payment to {tx.merchant}",
        return_url=request.return_url,
        cancel_url=request.cancel_url
    )

    # Update transaction
    tx.paypal_order_id = order_result.get("order_id")
    tx.mode = order_result.get("mode", "DEMO")
    
    event = PaymentEvent(
        transaction_id=tx.id,
        event_type="ORDER_CREATED",
        payload_json=json.dumps(order_result)
    )
    db.add(event)
    db.commit()

    return order_result

@api_router.post("/payment/capture-order", tags=["Payments"])
async def capture_payment_order(
    request: PaymentCaptureOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Captures the authorized PayPal Sandbox Order (or Mock order).
    """
    tx = db.query(Transaction).filter(Transaction.id == request.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    order_id = request.paypal_order_id or tx.paypal_order_id
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing PayPal Order ID for capture")

    capture_result = await paypal_service.capture_order(order_id)

    # Finalize transaction state
    tx.paypal_capture_id = capture_result.get("capture_id")
    tx.payment_status = "COMPLETED" if capture_result.get("status") == "COMPLETED" else "FAILED"
    
    event = PaymentEvent(
        transaction_id=tx.id,
        event_type="CAPTURED",
        payload_json=json.dumps(capture_result)
    )
    db.add(event)
    db.commit()

    return {
        "transaction_id": tx.id,
        "paypal_order_id": order_id,
        "paypal_capture_id": tx.paypal_capture_id,
        "merchant": tx.merchant,
        "amount": tx.amount,
        "currency": tx.currency,
        "status": tx.payment_status,
        "mode": tx.mode,
        "completed_at": capture_result.get("completed_at", datetime.utcnow().isoformat()),
        "message": capture_result.get("message", "Payment captured successfully.")
    }

@api_router.post("/payment/{transaction_id}/cancel", tags=["Payments"])
async def cancel_payment_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    User elects to cancel or decline payment based on AI assessment.
    """
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    tx.payment_status = "CANCELLED"
    event = PaymentEvent(
        transaction_id=tx.id,
        event_type="CANCELLED",
        payload_json=json.dumps({"reason": "User chose to cancel after AI risk assessment"})
    )
    db.add(event)
    db.commit()
    return {"status": "CANCELLED", "transaction_id": transaction_id}

@api_router.get("/transactions", response_model=TransactionsListResponse, tags=["Transactions"])
async def get_transactions(
    risk_level: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH"),
    status: Optional[str] = Query(None, description="COMPLETED, PENDING, CANCELLED"),
    search: Optional[str] = Query(None, description="Search merchant or description"),
    sort_by: Optional[str] = Query("date", description="date, amount, risk"),
    db: Session = Depends(get_db)
):
    """Returns filtered, sorted list of transactions."""
    query = db.query(Transaction)

    if risk_level and risk_level.upper() != "ALL":
        query = query.filter(Transaction.risk_level == risk_level.upper())

    if status and status.upper() != "ALL":
        query = query.filter(Transaction.payment_status == status.upper())

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.merchant.ilike(search_fmt)) |
            (Transaction.description.ilike(search_fmt)) |
            (Transaction.category.ilike(search_fmt))
        )

    if sort_by == "amount":
        query = query.order_by(desc(Transaction.amount))
    elif sort_by == "risk":
        query = query.order_by(desc(Transaction.risk_score))
    else:
        query = query.order_by(desc(Transaction.created_at))

    txs = query.all()
    return TransactionsListResponse(
        total=len(txs),
        transactions=[TransactionResponse.model_validate(t) for t in txs]
    )

@api_router.get("/transactions/{transaction_id}", tags=["Transactions"])
async def get_transaction_details(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """Returns full details, risk assessment, and individual agent outputs for a transaction."""
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    assessment = db.query(RiskAssessment).filter(RiskAssessment.transaction_id == tx.id).first()
    agents = db.query(AgentResult).filter(AgentResult.transaction_id == tx.id).all()
    events = db.query(PaymentEvent).filter(PaymentEvent.transaction_id == tx.id).all()

    return {
        "transaction": TransactionResponse.model_validate(tx),
        "assessment": {
            "risk_score": assessment.risk_score if assessment else tx.risk_score,
            "risk_level": assessment.risk_level if assessment else tx.risk_level,
            "recommendation": assessment.recommendation if assessment else tx.ai_recommendation,
            "confidence": assessment.confidence if assessment else 0.9,
            "reasons": json.loads(assessment.reasons_json) if assessment and assessment.reasons_json else []
        } if assessment else None,
        "agents": [
            {
                "agent_name": a.agent_name,
                "status": a.status,
                "execution_time_ms": a.execution_time_ms,
                "output": json.loads(a.output_data_json) if a.output_data_json else {}
            }
            for a in agents
        ],
        "events": [
            {
                "event_type": e.event_type,
                "created_at": e.created_at.isoformat()
            }
            for e in events
        ]
    }

@api_router.get("/insights", response_model=InsightsResponse, tags=["Analytics"])
async def get_insights(db: Session = Depends(get_db)):
    """Returns dynamic spending, category breakdowns, and risk trends."""
    return transaction_service.get_insights(db)

@api_router.post("/seed", tags=["System"])
async def reseed_database(
    force: bool = Query(True, description="Force overwrite existing transactions with fresh demo data"),
    db: Session = Depends(get_db)
):
    """Reseeds synthetic transaction data for hackathon demonstrations."""
    seed_database(db, force=force)
    return {"message": "Demo transaction database reseeded successfully with 32 realistic synthetic transactions."}
