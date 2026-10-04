from typing import Dict, Any
from app.agents.base import BaseAgent
from app.schemas.agents import SpendingInsightOutput

class SpendingInsightAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Spending Insight Agent",
            role="Benchmarks current transaction against historical category spending and monthly patterns"
        )

    async def process(self, context: Dict[str, Any]) -> SpendingInsightOutput:
        amount = float(context.get("amount", 0.0))
        category = context.get("category", "Other")
        currency = context.get("currency", "USD")
        historical_user_avg = float(context.get("historical_user_avg", 85.0))
        category_stats = context.get("category_stats", {})  # { "Food": 45.0, "Shopping": 110.0, ... }
        
        category_avg = float(category_stats.get(category, historical_user_avg))
        
        # Calculate comparison percentage vs user average
        if historical_user_avg > 0:
            pct_diff = round(((amount - historical_user_avg) / historical_user_avg) * 100, 1)
        else:
            pct_diff = 0.0

        # Spending Trend & Impact
        if pct_diff > 150:
            trend = "SPIKE"
            impact = f"High impact: Represents {abs(pct_diff):.0f}% more than your typical spend."
            insight = f"This payment of {currency} {amount:,.2f} is significantly higher (+{pct_diff}%) than your overall average of {currency} {historical_user_avg:,.2f} and category average of {currency} {category_avg:,.2f}."
            status = "WARNING"
        elif pct_diff > 30:
            trend = "INCREASING"
            impact = f"Moderate impact: {pct_diff:+.1f}% above your normal transaction size."
            insight = f"This payment is {pct_diff:+.1f}% above your average transaction of {currency} {historical_user_avg:,.2f}. Stated category '{category}' typically averages {currency} {category_avg:,.2f}."
            status = "SUCCESS"
        elif pct_diff < -30:
            trend = "STEADY"
            impact = f"Minor impact: {abs(pct_diff):.1f}% below your usual transaction amount."
            insight = f"This payment is {abs(pct_diff):.1f}% lower than your typical transaction. It falls well within your routine budget."
            status = "SUCCESS"
        else:
            trend = "STEADY"
            impact = "Consistent with your standard monthly expense pattern."
            insight = f"This transaction aligns closely with your historical average of {currency} {historical_user_avg:,.2f} ({pct_diff:+.1f}% variance)."
            status = "SUCCESS"

        return SpendingInsightOutput(
            agent_name=self.name,
            user_historical_avg=round(historical_user_avg, 2),
            category_historical_avg=round(category_avg, 2),
            current_vs_avg_percentage=pct_diff,
            monthly_budget_impact=impact,
            spending_trend=trend,
            spending_insight=insight,
            status=status
        )

spending_agent = SpendingInsightAgent()
