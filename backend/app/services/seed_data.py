from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.database.models import User, Transaction, RiskAssessment, PaymentEvent

MERCHANTS = [
    {"name": "FreshMart", "email": "billing@freshmart.com", "category": "Food", "typical_amount": 45.0},
    {"name": "FoodExpress", "email": "orders@foodexpress.io", "category": "Food", "typical_amount": 28.5},
    {"name": "CloudCafe", "email": "pay@cloudcafe.net", "category": "Food", "typical_amount": 14.5},
    {"name": "TechWorld", "email": "accounts@techworld.store", "category": "Shopping", "typical_amount": 180.0},
    {"name": "BookNest", "email": "support@booknest.org", "category": "Shopping", "typical_amount": 32.0},
    {"name": "TravelGo", "email": "reservations@travelgo.com", "category": "Travel", "typical_amount": 420.0},
    {"name": "EduLearn", "email": "tuition@edulearn.org", "category": "Education", "typical_amount": 120.0},
    {"name": "MovieHub", "email": "sub@moviehub.tv", "category": "Entertainment", "typical_amount": 15.99},
    {"name": "MetroUtility", "email": "billing@metroutility.gov", "category": "Bills", "typical_amount": 95.0},
    {"name": "DevHost Cloud", "email": "billing@devhost.cloud", "category": "Services", "typical_amount": 65.0},
]

def seed_database(db: Session, force: bool = False):
    """
    Seeds realistic synthetic transactions (32 items) if the database is empty or force=True.
    """
    existing_count = db.query(Transaction).count()
    if existing_count >= 20 and not force:
        return

    # Ensure demo user exists
    user = db.query(User).filter(User.username == "demo_user").first()
    if not user:
        user = User(
            username="demo_user",
            email="demo@paypilot.ai"
        )
        db.add(user)
        db.flush()

    # Clear old data if forcing
    if force:
        db.query(PaymentEvent).delete()
        db.query(RiskAssessment).delete()
        db.query(Transaction).delete()
        db.flush()

    now = datetime.utcnow()
    
    # 32 Realistic synthetic transactions
    seed_records = [
        # Normal recurring and daily transactions (Low Risk)
        {"merchant": "FreshMart", "email": "billing@freshmart.com", "amount": 42.50, "cat": "Food", "desc": "Weekly organic groceries", "days_ago": 1, "risk": 15, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "CloudCafe", "email": "pay@cloudcafe.net", "amount": 12.80, "cat": "Food", "desc": "Morning latte and pastry", "days_ago": 2, "risk": 10, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "MovieHub", "email": "sub@moviehub.tv", "amount": 15.99, "cat": "Entertainment", "desc": "Monthly 4K streaming plan", "days_ago": 3, "risk": 12, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "FoodExpress", "email": "orders@foodexpress.io", "amount": 34.20, "cat": "Food", "desc": "Dinner delivery", "days_ago": 4, "risk": 18, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "DevHost Cloud", "email": "billing@devhost.cloud", "amount": 49.00, "cat": "Services", "desc": "Monthly server hosting fee", "days_ago": 5, "risk": 15, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "BookNest", "email": "support@booknest.org", "amount": 29.50, "cat": "Shopping", "desc": "System design paperback books", "days_ago": 6, "risk": 20, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "MetroUtility", "email": "billing@metroutility.gov", "amount": 115.40, "cat": "Bills", "desc": "Electricity and water utility statement", "days_ago": 7, "risk": 22, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "FreshMart", "email": "billing@freshmart.com", "amount": 58.10, "cat": "Food", "desc": "Produce and household items", "days_ago": 8, "risk": 16, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "EduLearn", "email": "tuition@edulearn.org", "amount": 89.00, "cat": "Education", "desc": "Advanced TypeScript masterclass", "days_ago": 9, "risk": 20, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "CloudCafe", "email": "pay@cloudcafe.net", "amount": 8.50, "cat": "Food", "desc": "Espresso on the go", "days_ago": 10, "risk": 8, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},

        # Moderate variance & larger purchases (Medium Risk)
        {"merchant": "TechWorld", "email": "accounts@techworld.store", "amount": 349.99, "cat": "Shopping", "desc": "External 4K Monitor for workspace", "days_ago": 11, "risk": 48, "lvl": "MEDIUM", "status": "COMPLETED", "rec": "REVIEW RECOMMENDED"},
        {"merchant": "TravelGo", "email": "reservations@travelgo.com", "amount": 540.00, "cat": "Travel", "desc": "Roundtrip domestic flight tickets", "days_ago": 12, "risk": 52, "lvl": "MEDIUM", "status": "COMPLETED", "rec": "REVIEW RECOMMENDED"},
        {"merchant": "FoodExpress", "email": "orders@foodexpress.io", "amount": 92.40, "cat": "Food", "desc": "Team lunch catering", "days_ago": 13, "risk": 42, "lvl": "MEDIUM", "status": "COMPLETED", "rec": "REVIEW RECOMMENDED"},
        {"merchant": "EduLearn", "email": "tuition@edulearn.org", "amount": 250.00, "cat": "Education", "desc": "Quarterly cloud certification vouchers", "days_ago": 14, "risk": 45, "lvl": "MEDIUM", "status": "COMPLETED", "rec": "REVIEW RECOMMENDED"},
        {"merchant": "TechWorld", "email": "accounts@techworld.store", "amount": 185.00, "cat": "Shopping", "desc": "Mechanical keyboard and mouse", "days_ago": 15, "risk": 41, "lvl": "MEDIUM", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        
        # High Risk and Flagged transactions
        {"merchant": "Unknown Escrow Ltd", "email": "wire-urgent@tempmail.xyz", "amount": 2850.00, "cat": "Services", "desc": "Urgent offshore deposit wire transfer", "days_ago": 16, "risk": 88, "lvl": "HIGH", "status": "CANCELLED", "rec": "HIGH RISK"},
        {"merchant": "CryptoFast P2P", "email": "instant@disposable.org", "amount": 1500.00, "cat": "Shopping", "desc": "Immediate crypto token release", "days_ago": 17, "risk": 92, "lvl": "HIGH", "status": "CANCELLED", "rec": "HIGH RISK"},
        {"merchant": "LotteryClaim Direct", "email": "claims@lottery-winner.top", "amount": 450.00, "cat": "Bills", "desc": "Processing fee for prize distribution", "days_ago": 18, "risk": 95, "lvl": "HIGH", "status": "CANCELLED", "rec": "HIGH RISK"},

        # Duplicate simulated sequence
        {"merchant": "CloudCafe", "email": "pay@cloudcafe.net", "amount": 24.50, "cat": "Food", "desc": "Brunch meeting", "days_ago": 19, "risk": 15, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "CloudCafe", "email": "pay@cloudcafe.net", "amount": 24.50, "cat": "Food", "desc": "Brunch meeting (accidental re-tap)", "days_ago": 19, "risk": 65, "lvl": "MEDIUM", "status": "CANCELLED", "rec": "REVIEW RECOMMENDED"},

        # More routine distributed over 20-45 days ago
        {"merchant": "FreshMart", "email": "billing@freshmart.com", "amount": 62.15, "cat": "Food", "desc": "Bi-weekly groceries", "days_ago": 21, "risk": 14, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "MovieHub", "email": "sub@moviehub.tv", "amount": 15.99, "cat": "Entertainment", "desc": "Monthly subscription renewal", "days_ago": 23, "risk": 10, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "MetroUtility", "email": "billing@metroutility.gov", "amount": 88.30, "cat": "Bills", "desc": "High-speed broadband internet", "days_ago": 25, "risk": 18, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "BookNest", "email": "support@booknest.org", "amount": 44.00, "cat": "Shopping", "desc": "Clean Code and Architecture books", "days_ago": 26, "risk": 15, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "TravelGo", "email": "reservations@travelgo.com", "amount": 190.00, "cat": "Travel", "desc": "Weekend hotel booking", "days_ago": 28, "risk": 44, "lvl": "MEDIUM", "status": "COMPLETED", "rec": "REVIEW RECOMMENDED"},
        {"merchant": "FoodExpress", "email": "orders@foodexpress.io", "amount": 27.50, "cat": "Food", "desc": "Lunch delivery", "days_ago": 29, "risk": 12, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "FreshMart", "email": "billing@freshmart.com", "amount": 51.30, "cat": "Food", "desc": "Weekly grocery staples", "days_ago": 32, "risk": 15, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "TechWorld", "email": "accounts@techworld.store", "amount": 79.99, "cat": "Shopping", "desc": "USB-C docking hub", "days_ago": 35, "risk": 24, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "EduLearn", "email": "tuition@edulearn.org", "amount": 149.00, "cat": "Education", "desc": "Python Data Engineering Bootcamp", "days_ago": 38, "risk": 25, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "DevHost Cloud", "email": "billing@devhost.cloud", "amount": 49.00, "cat": "Services", "desc": "Server recurring charge", "days_ago": 40, "risk": 12, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "MetroUtility", "email": "billing@metroutility.gov", "amount": 102.50, "cat": "Bills", "desc": "Municipal energy statement", "days_ago": 42, "risk": 20, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"},
        {"merchant": "FoodExpress", "email": "orders@foodexpress.io", "amount": 31.80, "cat": "Food", "desc": "Weekend sushi takeout", "days_ago": 45, "risk": 14, "lvl": "LOW", "status": "COMPLETED", "rec": "SAFE TO PROCEED"}
    ]

    for item in seed_records:
        created_time = now - timedelta(days=item["days_ago"], hours=random.randint(1, 12), minutes=random.randint(0, 59))
        tx = Transaction(
            id=f"TX-{random.randint(100000, 999999)}",
            user_id=user.id,
            merchant=item["merchant"],
            merchant_email=item["email"],
            amount=item["amount"],
            currency="USD",
            category=item["cat"],
            description=item["desc"],
            purpose=f"Payment for {item['desc']}",
            notes="Routine transaction verified by PayPilot AI" if item["lvl"] == "LOW" else "Flagged for user inspection",
            risk_score=item["risk"],
            risk_level=item["lvl"],
            ai_recommendation=item["rec"],
            payment_status=item["status"],
            mode="DEMO",
            paypal_order_id=f"MOCK-ORD-{random.randint(10000, 99999)}" if item["status"] == "COMPLETED" else None,
            paypal_capture_id=f"MOCK-CAP-{random.randint(10000, 99999)}" if item["status"] == "COMPLETED" else None,
            created_at=created_time
        )
        db.add(tx)
        db.flush()

        assessment = RiskAssessment(
            transaction_id=tx.id,
            risk_score=item["risk"],
            risk_level=item["lvl"],
            recommendation=item["rec"],
            confidence=0.92,
            reasons_json=f'["{item["desc"]}", "Historical baseline within normal limit"]',
            created_at=created_time
        )
        db.add(assessment)

    db.commit()

