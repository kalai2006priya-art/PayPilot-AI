import asyncio
import json
from app.database.session import SessionLocal, Base, engine
from app.database.models import User, Transaction
from app.services.seed_data import seed_database
from app.services.transaction_service import transaction_service
from app.agents.orchestrator import orchestrator
from app.services.paypal_service import paypal_service

async def run_tests():
    print("--- [1] Initializing SQLite Database & Seeding ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db, force=True)
    tx_count = db.query(Transaction).count()
    print(f"Database seeded successfully with {tx_count} transactions.")

    print("\n--- [2] Testing Low-Risk Transaction (FreshMart $38.20 - unique amount) ---")
    low_risk_data = {
        "amount": 38.20,
        "currency": "USD",
        "merchant": "FreshMart",
        "merchant_email": "billing@freshmart.com",
        "category": "Food",
        "description": "Weekly organic groceries",
        "purpose": "Personal groceries",
        "notes": "Routine weekly purchase"
    }
    tx1 = transaction_service.create_pending_transaction(db, low_risk_data)
    profile = transaction_service.get_historical_profile(db)
    res1 = await orchestrator.run_pipeline(
        transaction_id=tx1.id,
        payment_data=low_risk_data,
        historical_user_avg=profile["historical_user_avg"],
        category_stats=profile["category_stats"],
        recent_transactions=profile["recent_transactions"]
    )
    transaction_service.save_analysis_results(db, tx1.id, res1)
    print(f"Risk Score: {res1.risk_score} | Level: {res1.risk_level} | Recommendation: {res1.recommendation}")
    print(f"Steps executed: {len(res1.steps)} micro-agents.")
    assert res1.risk_score < 40, f"Expected low risk, got {res1.risk_score}"
    assert res1.recommendation == "SAFE TO PROCEED", f"Expected SAFE TO PROCEED, got {res1.recommendation}"

    print("\n--- [3] Testing High-Risk Transaction (Unknown Wire $3,500.00) ---")
    high_risk_data = {
        "amount": 3500.00,
        "currency": "USD",
        "merchant": "Unknown Escrow Ltd",
        "merchant_email": "wire-fast@tempmail.xyz",
        "category": "Services",
        "description": "URGENT offshore crypto release immediately",
        "purpose": "Emergency prize release wire",
        "notes": "Penalty warning if not wired within 10 minutes"
    }
    tx2 = transaction_service.create_pending_transaction(db, high_risk_data)
    res2 = await orchestrator.run_pipeline(
        transaction_id=tx2.id,
        payment_data=high_risk_data,
        historical_user_avg=profile["historical_user_avg"],
        category_stats=profile["category_stats"],
        recent_transactions=profile["recent_transactions"]
    )
    transaction_service.save_analysis_results(db, tx2.id, res2)
    print(f"Risk Score: {res2.risk_score} | Level: {res2.risk_level} | Recommendation: {res2.recommendation}")
    assert res2.risk_score >= 70, f"Expected high risk, got {res2.risk_score}"
    assert res2.recommendation == "HIGH RISK", f"Expected HIGH RISK, got {res2.recommendation}"

    print("\n--- [4] Testing PayPal Sandbox / Demo Order Creation & Capture ---")
    order = await paypal_service.create_order(amount=tx1.amount, currency="USD", merchant=tx1.merchant)
    print(f"Order Created: ID={order['order_id']}, Mode={order['mode']}, Status={order['status']}")
    capture = await paypal_service.capture_order(order_id=order["order_id"])
    print(f"Order Captured: CaptureID={capture['capture_id']}, Status={capture['status']}")
    assert capture["status"] == "COMPLETED"

    print("\n--- [5] Testing Insights Generation ---")
    insights = transaction_service.get_insights(db)
    print(f"Total Transactions: {insights.total_transactions}")
    print(f"Total Spent: ${insights.total_spent:,.2f}")
    print(f"Average Transaction: ${insights.avg_transaction_amount:,.2f}")
    print(f"Category Spend Count: {len(insights.category_spending)}")

    db.close()
    print("\n[SUCCESS] ALL BACKEND & AGENT VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
