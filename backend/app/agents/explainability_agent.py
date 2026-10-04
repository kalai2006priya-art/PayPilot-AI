from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.schemas.agents import ExplainabilityOutput, ExplainabilityFactor

class ExplainabilityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Explainability Agent",
            role="Translates technical agent signals and mathematical metrics into plain, friendly human insights"
        )

    async def process(self, context: Dict[str, Any]) -> ExplainabilityOutput:
        amount = float(context.get("amount", 0.0))
        currency = context.get("currency", "USD")
        merchant = context.get("merchant", "").strip()
        category = context.get("category", "Other")
        
        understanding = context.get("understanding_output", {})
        risk = context.get("risk_output", {})
        fraud = context.get("fraud_output", {})
        spending = context.get("spending_output", {})
        recommendation = context.get("recommendation_output", {})

        score = risk.get("risk_score", 15)
        level = risk.get("risk_level", "LOW")
        variance = spending.get("current_vs_avg_percentage", 0.0)
        duplicate = fraud.get("duplicate_detected", False)
        urgency = understanding.get("urgency_detected", False)

        # 1. Plain Human Summary
        if level == "HIGH":
            human_summary = f"⚠️ PayPilot identified caution flags regarding this {currency} {amount:,.2f} payment to {merchant}. The transaction deviates notably from your spending profile and triggered risk indicators."
        elif level == "MEDIUM":
            human_summary = f"ℹ️ PayPilot recommends a quick double-check for this {currency} {amount:,.2f} payment to {merchant}. The details are mostly clear, but there is notable variance from your routine transactions."
        else:
            human_summary = f"✅ PayPilot analyzed your {currency} {amount:,.2f} payment to {merchant}. All key metrics align with your normal spending habits, and no suspicious indicators were detected."

        # 2. "Why am I seeing this?" bullet list
        why_see_this: List[str] = []
        if duplicate:
            why_see_this.append("Duplicate check: We identified a recent payment of the same amount to this merchant.")
        if abs(variance) > 50:
            direction = "higher" if variance > 0 else "lower"
            why_see_this.append(f"Spending deviation: This amount is {abs(variance):.0f}% {direction} than your average transaction.")
        else:
            why_see_this.append(f"Normal range: Amount ({currency} {amount:,.2f}) matches your regular transaction spectrum.")

        if urgency:
            why_see_this.append("Language alert: Transaction notes contain urgent phrasing commonly seen in pressure tactics.")
        else:
            why_see_this.append("Intent clarity: Payment description aligns with typical category purchases.")

        if fraud.get("overall_fraud_severity") == "LOW":
            why_see_this.append("Integrity check: No velocity anomalies or flagged merchant domains found.")

        # 3. Structured Factors for the Expandable "Why did PayPilot give this result?" section
        breakdown_factors: List[ExplainabilityFactor] = []

        # Factor A: Amount Analysis
        if abs(variance) < 15:
            amount_detail = f"Your payment is very close ({variance:+.1f}%) to your recent transaction benchmark of {currency} {spending.get('user_historical_avg', 0):,.2f}."
            amount_badge = "SAFE"
        elif variance > 100:
            amount_detail = f"Your payment is {variance:+.0f}% higher than your recent average transaction. Large spikes warrant confirmation."
            amount_badge = "WARNING"
        else:
            amount_detail = f"Your payment is {variance:+.1f}% compared to your typical benchmark. Within acceptable bounds."
            amount_badge = "CAUTION" if variance > 40 else "SAFE"
        
        breakdown_factors.append(ExplainabilityFactor(
            title="Amount Analysis",
            badge=amount_badge,
            detail=amount_detail
        ))

        # Factor B: Merchant Analysis
        if risk.get("risk_score", 0) > 65 and not context.get("merchant_email"):
            merchant_detail = f"Merchant '{merchant}' does not have a verified contact email provided."
            merchant_badge = "CAUTION"
        else:
            merchant_detail = f"Merchant '{merchant}' name and reference information appear complete and coherent."
            merchant_badge = "SAFE"

        breakdown_factors.append(ExplainabilityFactor(
            title="Merchant Analysis",
            badge=merchant_badge,
            detail=merchant_detail
        ))

        # Factor C: Duplicate Detection
        if duplicate:
            dup_detail = f"Potential duplicate detected: A similar charge was found in your recent transaction history."
            dup_badge = "WARNING"
        else:
            dup_detail = "No identical or duplicate transaction detected in the last 48 hours."
            dup_badge = "SAFE"

        breakdown_factors.append(ExplainabilityFactor(
            title="Duplicate Detection",
            badge=dup_badge,
            detail=dup_detail
        ))

        # Factor D: Timing Analysis
        timing = risk.get("timing_risk", "NORMAL")
        if timing == "UNUSUAL_HOURS":
            timing_detail = "Initiated during non-standard early-morning hours."
            timing_badge = "CAUTION"
        else:
            timing_detail = "Payment timing is consistent with standard consumer activity."
            timing_badge = "SAFE"

        breakdown_factors.append(ExplainabilityFactor(
            title="Timing Analysis",
            badge=timing_badge,
            detail=timing_detail
        ))

        # Factor E: Spending Pattern
        breakdown_factors.append(ExplainabilityFactor(
            title="Spending Pattern",
            badge="SAFE" if abs(variance) < 60 else "CAUTION",
            detail=f"Category '{category}' historically averages {currency} {spending.get('category_historical_avg', 0):,.2f}. {spending.get('monthly_budget_impact', '')}"
        ))

        return ExplainabilityOutput(
            agent_name=self.name,
            human_summary=human_summary,
            why_see_this=why_see_this,
            breakdown_factors=breakdown_factors,
            disclaimer="PayPilot AI provides informational risk assessments to assist your payment decisions. This does not constitute financial advice or a transaction guarantee. You maintain full control over whether to complete this payment.",
            status="SUCCESS"
        )

explainability_agent = ExplainabilityAgent()
