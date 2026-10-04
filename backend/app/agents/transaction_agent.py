import re
from typing import Dict, Any
from app.agents.base import BaseAgent
from app.agents.llm_client import llm_client
from app.schemas.agents import TransactionUnderstandingOutput

SYSTEM_PROMPT = """
You are the Transaction Understanding Agent in PayPilot AI.
Analyze the user's payment parameters (amount, currency, merchant, category, description, purpose, notes).
Extract structured intent, determine whether the stated category matches the description, detect any urgency language,
and highlight any unusual transaction characteristics.
Return strict JSON matching the schema:
{
  "detected_intent": string,
  "category_match": boolean,
  "urgency_detected": boolean,
  "unusual_characteristics": [string],
  "structured_summary": { ... }
}
Do NOT hallucinate facts. Rely only on the provided payment inputs.
"""

class TransactionUnderstandingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Transaction Understanding Agent",
            role="Extracts transaction context, validates category alignment, and identifies urgency cues"
        )

    async def process(self, context: Dict[str, Any]) -> TransactionUnderstandingOutput:
        amount = context.get("amount", 0.0)
        currency = context.get("currency", "USD")
        merchant = context.get("merchant", "").strip()
        category = context.get("category", "Other")
        description = context.get("description", "").strip()
        purpose = context.get("purpose", "").strip()
        notes = context.get("notes", "").strip()

        # Try LLM first if configured
        prompt = f"""
        Payment Details:
        - Merchant: {merchant}
        - Amount: {currency} {amount}
        - Category: {category}
        - Description: {description}
        - Purpose: {purpose}
        - Notes: {notes}
        """
        llm_response = await llm_client.generate_json(prompt, SYSTEM_PROMPT)
        if llm_response and "detected_intent" in llm_response:
            return TransactionUnderstandingOutput(
                agent_name=self.name,
                detected_intent=llm_response.get("detected_intent", f"Payment to {merchant}"),
                category_match=llm_response.get("category_match", True),
                urgency_detected=llm_response.get("urgency_detected", False),
                unusual_characteristics=llm_response.get("unusual_characteristics", []),
                structured_summary=llm_response.get("structured_summary", {}),
                status="WARNING" if llm_response.get("urgency_detected") else "SUCCESS"
            )

        # Autonomous Heuristic Engine Fallback
        text_corpus = f"{description} {purpose} {notes}".lower()
        urgency_keywords = ["urgent", "immediately", "wire fast", "asap", "emergency", "penalty", "lottery", "crypto", "bitcoin", "gift card", "ransom", "seized", "bail"]
        found_urgency = [word for word in urgency_keywords if re.search(r'\b' + re.escape(word) + r'\b', text_corpus)]
        
        unusual = []
        if found_urgency:
            unusual.append(f"High-urgency language detected: '{', '.join(found_urgency)}'")

        # Mismatch checks
        category_match = True
        lower_cat = category.lower()
        if "crypto" in text_corpus or "bitcoin" in text_corpus:
            if lower_cat not in ["investment", "services"]:
                category_match = False
                unusual.append("Payment description suggests cryptocurrency transfer, which conflicts with stated category.")
        if "gift card" in text_corpus and lower_cat not in ["shopping", "gift"]:
            category_match = False
            unusual.append("Payment mentions gift cards outside a retail shopping context.")

        # Determine Intent
        if purpose:
            intent = f"{purpose} payment to {merchant}"
        elif description:
            intent = f"Purchase for '{description}' from {merchant}"
        else:
            intent = f"Direct payment to {merchant} under category {category}"

        status = "ALERT" if found_urgency and not category_match else ("WARNING" if found_urgency or not category_match else "SUCCESS")

        return TransactionUnderstandingOutput(
            agent_name=self.name,
            detected_intent=intent,
            category_match=category_match,
            urgency_detected=len(found_urgency) > 0,
            unusual_characteristics=unusual,
            structured_summary={
                "merchant": merchant,
                "amount": f"{currency} {amount:,.2f}",
                "category": category,
                "verified_fields": ["amount", "merchant", "currency"]
            },
            status=status
        )

transaction_agent = TransactionUnderstandingAgent()
