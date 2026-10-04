from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# 1. Transaction Understanding Agent Schema
class TransactionUnderstandingOutput(BaseModel):
    agent_name: str = "Transaction Understanding Agent"
    detected_intent: str = Field(..., description="Detected user intent, e.g. Grocery Purchase, Recurring SaaS, Person-to-person Wire")
    category_match: bool = Field(True, description="Whether description matches category")
    urgency_detected: bool = Field(False, description="Whether urgent language was detected")
    unusual_characteristics: List[str] = Field(default_factory=list, description="Unusual phrasing or mismatched fields")
    structured_summary: Dict[str, Any] = Field(default_factory=dict)
    status: str = "SUCCESS"  # SUCCESS, WARNING, ALERT

# 2. Risk Analysis Agent Schema
class RiskAnalysisOutput(BaseModel):
    agent_name: str = "Risk Analysis Agent"
    risk_score: int = Field(..., ge=0, le=100, description="Risk score from 0 (very safe) to 100 (high risk)")
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH")
    risk_factors: List[str] = Field(default_factory=list, description="Specific risk factors identified")
    timing_risk: str = Field("NORMAL", description="NORMAL, UNUSUAL_HOURS, RAPID_VELOCITY")
    amount_risk: str = Field("NORMAL", description="NORMAL, ELEVATED, EXTREME_SPIKE")
    status: str = "SUCCESS"

# 3. Fraud Signal Agent Schema
class FraudSignal(BaseModel):
    code: str
    severity: str  # INFO, WARNING, CRITICAL
    description: str

class FraudSignalOutput(BaseModel):
    agent_name: str = "Fraud Signal Agent"
    fraud_signals: List[FraudSignal] = Field(default_factory=list)
    duplicate_detected: bool = Field(False, description="Whether a similar transaction was seen recently")
    duplicate_transaction_id: Optional[str] = None
    sudden_amount_increase: bool = False
    suspicious_merchant_signals: List[str] = Field(default_factory=list)
    overall_fraud_severity: str = "LOW"  # LOW, MEDIUM, CRITICAL
    status: str = "SUCCESS"

# 4. Spending Insight Agent Schema
class SpendingInsightOutput(BaseModel):
    agent_name: str = "Spending Insight Agent"
    user_historical_avg: float = Field(..., description="Average transaction amount for this user")
    category_historical_avg: float = Field(..., description="Average transaction amount for this category")
    current_vs_avg_percentage: float = Field(..., description="Percentage higher or lower than user avg (+35%, -10%, etc.)")
    monthly_budget_impact: str = Field(..., description="e.g., 'Consumes 3.2% of estimated monthly budget'")
    spending_trend: str = Field(..., description="STEADY, INCREASING, SPIKE")
    spending_insight: str = Field(..., description="Human-readable spending insight summary")
    status: str = "SUCCESS"

# 5. Recommendation Agent Schema
class RecommendationOutput(BaseModel):
    agent_name: str = "Recommendation Agent"
    recommendation: str = Field(..., description="SAFE TO PROCEED, REVIEW RECOMMENDED, HIGH RISK")
    recommendation_code: str = Field(..., description="PROCEED, REVIEW, CANCEL")
    confidence: float = Field(0.92, ge=0.0, le=1.0)
    primary_reasons: List[str] = Field(default_factory=list)
    actions_to_consider: List[str] = Field(default_factory=list)
    status: str = "SUCCESS"

# 6. Explainability Agent Schema
class ExplainabilityFactor(BaseModel):
    title: str
    badge: str  # SAFE, CAUTION, WARNING
    detail: str

class ExplainabilityOutput(BaseModel):
    agent_name: str = "Explainability Agent"
    human_summary: str
    why_see_this: List[str]
    breakdown_factors: List[ExplainabilityFactor]
    disclaimer: str = "PayPilot AI provides informational risk assessments to assist your payment decisions. This does not constitute financial advice or a transaction guarantee. You maintain full control over whether to complete this payment."
    status: str = "SUCCESS"

# Agent Execution Step for Visualizer
class AgentStepResult(BaseModel):
    agent_id: str
    agent_name: str
    role_description: str
    status: str  # COMPLETED, WARNING, ALERT, ERROR
    execution_time_ms: float
    output: Dict[str, Any]

# Unified Pipeline Assessment Response
class AgentPipelineResponse(BaseModel):
    transaction_id: str
    risk_score: int
    risk_level: str  # LOW, MEDIUM, HIGH
    recommendation: str  # SAFE TO PROCEED, REVIEW RECOMMENDED, HIGH RISK
    confidence: float
    reasons: List[str]
    steps: List[AgentStepResult]
    understanding: TransactionUnderstandingOutput
    risk_analysis: RiskAnalysisOutput
    fraud_signals: FraudSignalOutput
    spending_insights: SpendingInsightOutput
    recommendation_detail: RecommendationOutput
    explainability: ExplainabilityOutput
