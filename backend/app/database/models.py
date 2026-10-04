import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, default="demo_user")
    email = Column(String(255), unique=True, nullable=False, default="user@paypilot.demo")
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, default=lambda: f"TX-{uuid.uuid4().hex[:10].upper()}")
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    merchant = Column(String(255), nullable=False)
    merchant_email = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    category = Column(String(50), default="Other", nullable=False)
    description = Column(String(500), nullable=True)
    purpose = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    # AI Assessment Fields
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH
    ai_recommendation = Column(String(50), default="SAFE TO PROCEED")
    
    # Payment Gateway Fields
    paypal_order_id = Column(String(100), nullable=True)
    paypal_capture_id = Column(String(100), nullable=True)
    payment_status = Column(String(30), default="PENDING")  # PENDING, COMPLETED, CANCELLED, FLAGGED
    mode = Column(String(30), default="DEMO")  # DEMO or PAYPAL_SANDBOX
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    assessment = relationship("RiskAssessment", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    agent_results = relationship("AgentResult", back_populates="transaction", cascade="all, delete-orphan")
    events = relationship("PaymentEvent", back_populates="transaction", cascade="all, delete-orphan")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)
    recommendation = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.9)
    reasons_json = Column(Text, nullable=False)  # JSON serialized list of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="assessment")


class AgentResult(Base):
    __tablename__ = "agent_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, WARNING, ALERT
    output_data_json = Column(Text, nullable=False)  # JSON serialized structured output
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="agent_results")


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # ANALYZED, ORDER_CREATED, CAPTURED, CANCELLED
    payload_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="events")
