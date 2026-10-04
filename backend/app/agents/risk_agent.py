from typing import Dict, Any, List
from datetime import datetime
from app.agents.base import BaseAgent
from app.agents.llm_client import llm_client
from app.schemas.agents import RiskAnalysisOutput

SYSTEM_PROMPT = """
You are the Risk Analysis Agent in PayPilot AI.
Analyze the supplied transaction context, historical benchmarks, and prior understanding outputs.
Compute an objective risk score from 0 (completely normal/safe) to 100 (high risk).
Assign risk_level: "LOW" (0-39), "MEDIUM" (40-69), or "HIGH" (70-100).
Provide specific risk factors. Never claim certainty about fraud; only highlight risk signals.
Return JSON:
{
  "risk_score": integer,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "risk_factors": [string],
  "timing_risk": "NORMAL" | "UNUSUAL_HOURS" | "RAPID_VELOCITY",
  "amount_risk": "NORMAL" | "ELEVATED" | "EXTREME_SPIKE"
}
"""

class RiskAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Risk Analysis Agent",
            role="Evaluates transaction parameters against baseline risk models, timing, and amounts"
        )

    async def process(self, context: Dict[str, Any]) -> RiskAnalysisOutput:
        amount = float(context.get("amount", 0.0))
        merchant = context.get("merchant", "").strip()
        merchant_email = context.get("merchant_email", "").strip()
        understanding = context.get("understanding_output", {})
        historical_avg = float(context.get("historical_user_avg", 85.0))
        
        # Check LLM if configured
        prompt = f"""
        Transaction to evaluate:
        - Merchant: {merchant} (Email: {merchant_email})
        - Amount: ${amount:.2f}
        - User Historical Avg: ${historical_avg:.2f}
        - Urgency Detected: {understanding.get('urgency_detected', False)}
        - Category Match: {understanding.get('category_match', True)}
        - Unusual Characteristics: {understanding.get('unusual_characteristics', [])}
        """
        llm_response = await llm_client.generate_json(prompt, SYSTEM_PROMPT)
        if llm_response and "risk_score" in llm_response:
            score = max(0, min(100, int(llm_response.get("risk_score", 15))))
            level = "HIGH" if score >= 70 else ("MEDIUM" if score >= 40 else "LOW")
            return RiskAnalysisOutput(
                agent_name=self.name,
                risk_score=score,
                risk_level=level,
                risk_factors=llm_response.get("risk_factors", []),
                timing_risk=llm_response.get("timing_risk", "NORMAL"),
                amount_risk=llm_response.get("amount_risk", "NORMAL"),
                status="ALERT" if level == "HIGH" else ("WARNING" if level == "MEDIUM" else "SUCCESS")
            )

        # Autonomous Heuristic Scoring Model
        score = 15  # Baseline normal friction
        factors: List[str] = []
        
        # 1. Amount Evaluation
        ratio = amount / historical_avg if historical_avg > 0 else 1.0
        amount_risk = "NORMAL"
        if ratio > 10.0:
            score += 35
            amount_risk = "EXTREME_SPIKE"
            factors.append(f"Payment amount (${amount:,.2f}) is over 10x your average transaction benchmark (${historical_avg:,.2f}).")
        elif ratio > 3.0:
            score += 20
            amount_risk = "ELEVATED"
            factors.append(f"Payment amount (${amount:,.2f}) is substantially higher (>{ratio:.1f}x) than your typical spending.")
        elif ratio < 0.2 and amount > 5:
            factors.append("Payment amount is well within your routine low-friction range.")

        # 2. Urgency and context signals
        if understanding.get("urgency_detected"):
            score += 25
            factors.append("Payment description or notes contain high-urgency keywords often associated with pressure tactics.")

        if not understanding.get("category_match", True):
            score += 15
            factors.append("Context mismatch between selected category and payment purpose.")

        # 3. Merchant checks
        if merchant_email:
            lower_email = merchant_email.lower()
            suspicious_domains = ["tempmail", "disposable", "guerrillamail", "10minutemail", "xyz", "top"]
            if any(dom in lower_email for dom in suspicious_domains):
                score += 30
                factors.append(f"Merchant email domain '{merchant_email}' is associated with disposable or high-risk providers.")

        # 4. Known suspicious merchants / keywords in merchant name
        suspicious_merchants = ["wire-fast", "crypto-instant", "urgent-escrow", "lottery-claim", "unverified-agent"]
        if any(sm in merchant.lower() for sm in suspicious_merchants):
            score += 30
            factors.append(f"Merchant name '{merchant}' matches unverified or flagged remittance profiles.")

        # 5. Timing evaluation
        now_hour = datetime.utcnow().hour
        timing_risk = "NORMAL"
        if 1 <= now_hour <= 4:
            timing_risk = "UNUSUAL_HOURS"
            # Slight risk bump for middle of night transactions
            score += 8
            factors.append("Transaction initiated during atypical off-peak hours (1:00 AM - 4:00 AM UTC).")

        # Clamp score
        final_score = max(5, min(95, score))
        if final_score >= 70:
            risk_level = "HIGH"
            status = "ALERT"
        elif final_score >= 40:
            risk_level = "MEDIUM"
            status = "WARNING"
        else:
            risk_level = "LOW"
            status = "SUCCESS"

        if not factors:
            factors.append("All primary transaction risk metrics are within normal baseline thresholds.")

        return RiskAnalysisOutput(
            agent_name=self.name,
            risk_score=final_score,
            risk_level=risk_level,
            risk_factors=factors,
            timing_risk=timing_risk,
            amount_risk=amount_risk,
            status=status
        )

risk_agent = RiskAnalysisAgent()
