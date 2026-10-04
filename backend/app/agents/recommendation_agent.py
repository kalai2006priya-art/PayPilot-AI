from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.agents.llm_client import llm_client
from app.schemas.agents import RecommendationOutput

SYSTEM_PROMPT = """
You are the Recommendation Agent in PayPilot AI.
Synthesize the outputs of Transaction Understanding, Risk Analysis, Fraud Signals, and Spending Insights.
Generate an objective, actionable payment recommendation.
Possible recommendations:
- "SAFE TO PROCEED" (code: "PROCEED")
- "REVIEW RECOMMENDED" (code: "REVIEW")
- "HIGH RISK" (code: "CANCEL")
IMPORTANT: The recommendation must be presented as an informational AI assessment, NOT a financial guarantee.
Include 2-4 primary reasons and 2-3 prudent actions for the user to consider.
Return strict JSON:
{
  "recommendation": string,
  "recommendation_code": "PROCEED" | "REVIEW" | "CANCEL",
  "confidence": float (between 0.8 and 0.98),
  "primary_reasons": [string],
  "actions_to_consider": [string]
}
"""

class RecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Recommendation Agent",
            role="Synthesizes multi-agent signals into a clear, advisory decision recommendation"
        )

    async def process(self, context: Dict[str, Any]) -> RecommendationOutput:
        risk_output = context.get("risk_output", {})
        fraud_output = context.get("fraud_output", {})
        spending_output = context.get("spending_output", {})
        understanding_output = context.get("understanding_output", {})

        risk_score = risk_output.get("risk_score", 20)
        risk_level = risk_output.get("risk_level", "LOW")
        duplicate_detected = fraud_output.get("duplicate_detected", False)
        urgency_detected = understanding_output.get("urgency_detected", False)
        
        # Check LLM if enabled
        prompt = f"""
        Agent Findings:
        - Risk Score: {risk_score}/100 ({risk_level})
        - Risk Factors: {risk_output.get('risk_factors', [])}
        - Duplicate Detected: {duplicate_detected}
        - Fraud Severity: {fraud_output.get('overall_fraud_severity', 'LOW')}
        - Spending Insight: {spending_output.get('spending_insight', '')}
        - Urgency Flag: {urgency_detected}
        """
        llm_response = await llm_client.generate_json(prompt, SYSTEM_PROMPT)
        if llm_response and "recommendation" in llm_response:
            return RecommendationOutput(
                agent_name=self.name,
                recommendation=llm_response.get("recommendation", "SAFE TO PROCEED"),
                recommendation_code=llm_response.get("recommendation_code", "PROCEED"),
                confidence=float(llm_response.get("confidence", 0.92)),
                primary_reasons=llm_response.get("primary_reasons", []),
                actions_to_consider=llm_response.get("actions_to_consider", []),
                status="ALERT" if "HIGH" in llm_response.get("recommendation", "") else ("WARNING" if "REVIEW" in llm_response.get("recommendation", "") else "SUCCESS")
            )

        # Autonomous Heuristic Synthesis Engine
        primary_reasons: List[str] = []
        actions: List[str] = []

        if duplicate_detected:
            recommendation = "REVIEW RECOMMENDED"
            code = "REVIEW"
            status = "WARNING"
            confidence = 0.94
            primary_reasons.append("A matching transaction was recently executed with this merchant.")
            primary_reasons.append("Confirm this is not an unintended duplicate billing or double submission.")
            actions.append("Check your recent transaction history before paying.")
            actions.append("Confirm with the merchant whether the previous payment settled.")

        elif risk_level == "HIGH" or risk_score >= 70:
            recommendation = "HIGH RISK"
            code = "CANCEL"
            status = "ALERT"
            confidence = 0.91
            primary_reasons.append(f"Elevated risk score ({risk_score}/100) triggered by unusual amounts or high-friction signals.")
            if urgency_detected:
                primary_reasons.append("High-pressure or urgent language detected in the payment request.")
            for rf in risk_output.get("risk_factors", [])[:2]:
                if rf not in primary_reasons:
                    primary_reasons.append(rf)
            actions.append("Verify the recipient identity and authenticity independently out-of-band.")
            actions.append("Consider postponing or cancelling until recipient legitimacy is verified.")
            actions.append("Never share sensitive credentials or one-time codes.")

        elif risk_level == "MEDIUM" or risk_score >= 40:
            recommendation = "REVIEW RECOMMENDED"
            code = "REVIEW"
            status = "WARNING"
            confidence = 0.88
            primary_reasons.append(f"Moderate risk score ({risk_score}/100) due to variance from normal spending patterns.")
            for rf in risk_output.get("risk_factors", [])[:2]:
                if rf not in primary_reasons:
                    primary_reasons.append(rf)
            actions.append("Double-check invoice details, amount, and recipient email.")
            actions.append("Review payment terms and cancellation policies.")

        else:
            recommendation = "SAFE TO PROCEED"
            code = "PROCEED"
            status = "SUCCESS"
            confidence = 0.95
            primary_reasons.append("Amount is consistent with your typical routine spending range.")
            primary_reasons.append("Merchant and purpose details are complete with no suspicious patterns.")
            primary_reasons.append("No duplicate transactions or abnormal velocity signals detected.")
            actions.append("Review order summary and proceed with PayPal checkout when ready.")

        return RecommendationOutput(
            agent_name=self.name,
            recommendation=recommendation,
            recommendation_code=code,
            confidence=confidence,
            primary_reasons=primary_reasons,
            actions_to_consider=actions,
            status=status
        )

recommendation_agent = RecommendationAgent()
