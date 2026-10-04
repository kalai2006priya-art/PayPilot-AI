from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

class PaymentAnalyzeRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount must be greater than 0")
    currency: str = Field("USD", description="Currency code (USD, EUR, GBP, INR)")
    merchant: str = Field(..., min_length=1, description="Merchant name is required")
    merchant_email: Optional[str] = Field(None, description="Merchant email address")
    category: str = Field("Shopping", description="Category: Food, Shopping, Travel, Bills, Education, Entertainment, Services, Other")
    description: Optional[str] = Field("", description="Payment description or invoice note")
    purpose: Optional[str] = Field("", description="Stated payment purpose (Personal, Business, Subscription, Gift)")
    notes: Optional[str] = Field("", description="Optional notes from user")

    @field_validator("currency")
    def validate_currency(cls, v):
        allowed = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"]
        v_upper = v.strip().upper()
        if v_upper not in allowed:
            return "USD"
        return v_upper

    @field_validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 1000000:
            raise ValueError("Amount exceeds maximum demo threshold of 1,000,000")
        return round(v, 2)


class PaymentCreateOrderRequest(BaseModel):
    transaction_id: str = Field(..., description="ID of the analyzed transaction")
    return_url: Optional[str] = "http://localhost:5173/payment-success"
    cancel_url: Optional[str] = "http://localhost:5173/payment-cancelled"


class PaymentCaptureOrderRequest(BaseModel):
    transaction_id: str = Field(..., description="Internal transaction ID")
    paypal_order_id: Optional[str] = Field(None, description="PayPal Sandbox order ID")


class TransactionResponse(BaseModel):
    id: str
    merchant: str
    merchant_email: Optional[str] = None
    amount: float
    currency: str
    category: str
    description: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    risk_score: int
    risk_level: str
    ai_recommendation: str
    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    payment_status: str
    mode: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionsListResponse(BaseModel):
    total: int
    transactions: List[TransactionResponse]


class CategorySpend(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage: float


class MonthlySpend(BaseModel):
    month: str
    total_amount: float
    count: int


class InsightsResponse(BaseModel):
    total_transactions: int
    total_spent: float
    avg_transaction_amount: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    category_spending: List[CategorySpend]
    monthly_spending: List[MonthlySpend]
    key_insights: List[str]
    unusual_transactions: List[TransactionResponse]


class AgentStatusInfo(BaseModel):
    agent_id: str
    name: str
    role: str
    status: str
    model: str
    last_active: str


class SystemStatusResponse(BaseModel):
    paypal_mode: str  # "PAYPAL_SANDBOX" or "DEMO_MODE"
    ai_provider: str   # "GEMINI_API" or "AUTONOMOUS_HEURISTIC_ENGINE"
    database_status: str
    agents: List[AgentStatusInfo]
