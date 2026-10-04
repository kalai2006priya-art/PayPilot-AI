from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.agents.base import BaseAgent
from app.schemas.agents import FraudSignalOutput, FraudSignal

class FraudSignalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Fraud Signal Agent",
            role="Detects duplicate charges, velocity spikes, and high-frequency merchant anomalies"
        )

    async def process(self, context: Dict[str, Any]) -> FraudSignalOutput:
        amount = float(context.get("amount", 0.0))
        merchant = context.get("merchant", "").strip().lower()
        recent_transactions = context.get("recent_transactions", [])
        historical_avg = float(context.get("historical_user_avg", 85.0))
        current_tx_id = context.get("transaction_id")
        
        signals: List[FraudSignal] = []
        duplicate_detected = False
        duplicate_tx_id = None
        sudden_amount_increase = False
        suspicious_merchants: List[str] = []

        # 1. Duplicate Detection Check
        # Check if there is an existing historical transaction with the same merchant and amount
        for tx in recent_transactions:
            tx_id = tx.get("id")
            # Never match against the current transaction itself
            if current_tx_id and tx_id == current_tx_id:
                continue

            tx_merchant = (tx.get("merchant") or "").strip().lower()
            tx_amount = float(tx.get("amount", 0.0))
            
            # Direct match on merchant and amount (within $0.50 difference)
            if tx_merchant == merchant and abs(tx_amount - amount) < 0.50:
                duplicate_detected = True
                duplicate_tx_id = tx_id
                signals.append(FraudSignal(
                    code="DUPLICATE_TRANSACTION_DETECTED",
                    severity="WARNING",
                    description=f"Identical or near-identical charge (${tx_amount:,.2f}) to '{tx.get('merchant')}' found in recent records ({tx_id}). Possible accidental double click or duplicate billing."
                ))
                break

        # 2. Sudden Amount Increase Check
        if historical_avg > 0 and amount >= (historical_avg * 4.0):
            sudden_amount_increase = True
            signals.append(FraudSignal(
                code="VELOCITY_AMOUNT_SPIKE",
                severity="WARNING" if amount < 1500 else "CRITICAL",
                description=f"Transaction value (${amount:,.2f}) represents an abrupt deviation from regular spending behavior (>4x average)."
            ))

        # 3. Repeated attempts / Velocity test
        same_merchant_recent_count = sum(
            1 for tx in recent_transactions[:5] 
            if (tx.get("merchant") or "").strip().lower() == merchant
        )
        if same_merchant_recent_count >= 3:
            signals.append(FraudSignal(
                code="HIGH_MERCHANT_VELOCITY",
                severity="WARNING",
                description=f"Multiple recent payment interactions ({same_merchant_recent_count}) with merchant '{merchant}' detected in a brief window."
            ))

        # Determine severity
        has_critical = any(s.severity == "CRITICAL" for s in signals)
        has_warning = any(s.severity == "WARNING" for s in signals)
        
        if has_critical:
            overall_severity = "CRITICAL"
            status = "ALERT"
        elif has_warning:
            overall_severity = "MEDIUM"
            status = "WARNING"
        else:
            overall_severity = "LOW"
            status = "SUCCESS"
            signals.append(FraudSignal(
                code="CLEAN_RECORD",
                severity="INFO",
                description="No duplicate charges, frequency spikes, or flagged merchant signatures detected."
            ))

        return FraudSignalOutput(
            agent_name=self.name,
            fraud_signals=signals,
            duplicate_detected=duplicate_detected,
            duplicate_transaction_id=duplicate_tx_id,
            sudden_amount_increase=sudden_amount_increase,
            suspicious_merchant_signals=suspicious_merchants,
            overall_fraud_severity=overall_severity,
            status=status
        )

fraud_agent = FraudSignalAgent()
