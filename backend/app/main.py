from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.models import User, Transaction, RiskAssessment, AgentResult, PaymentEvent
from app.services.seed_data import seed_database
from app.api.router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("paypilot")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        logger.info("Verifying and seeding synthetic demo data...")
        seed_database(db, force=False)
    finally:
        db.close()
    
    logger.info(f"PayPilot AI Backend started successfully. Mode: {'PAYPAL_SANDBOX' if settings.is_paypal_configured else 'DEMO_MODE'}")
    yield
    logger.info("PayPilot AI Backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Agentic AI Payment Safety & Decision Assistant for PayPal AI Hackathon",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "PayPilot AI",
        "description": "Agentic AI Payment Safety & Decision Assistant",
        "hackathon": "PayPal AI Hackathon",
        "status": "online",
        "docs": "/docs",
        "paypal_mode": "PAYPAL_SANDBOX" if settings.is_paypal_configured else "DEMO_MODE",
        "ai_engine": "GEMINI_API" if settings.is_gemini_configured else "AUTONOMOUS_HEURISTIC_ENGINE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
