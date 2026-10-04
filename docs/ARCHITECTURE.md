# PayPilot AI - System Architecture

## Overview
**PayPilot AI** is an agentic AI payment safety and decision assistant developed for the **PayPal AI Hackathon 2026**. Rather than blindly sending payment orders to a payment gateway, PayPilot routes payment requests through a sequence of 6 specialized micro-agents that evaluate context, assess mathematical risk, scan for fraud indicators, benchmark against historical habits, synthesize recommendations, and generate transparent explanations.

```
                    ┌────────────────────────────┐
                    │      React + Vite UI       │
                    │ (Tailwind, Lucide, Recharts)│
                    └─────────────┬──────────────┘
                                  │
                       POST /api/payment/analyze
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │      FastAPI Backend       │
                    │   (Pydantic, SQLAlchemy)   │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │     PAYPILOT MULTI-AGENT PAYMENT INTELLIGENCE ENGINE   │
      │                                                        │
      │  1. Transaction Understanding Agent                    │
      │       ├── Context extraction & intent parsing          │
      │       └── Urgency keyword detection                    │
      │  2. Risk Analysis Agent                                │
      │       ├── 0-100 Mathematical risk scoring              │
      │       └── Timing and threshold evaluation              │
      │  3. Fraud Signal Agent                                 │
      │       ├── Duplicate transaction detection              │
      │       └── Velocity & untrusted domain checks           │
      │  4. Spending Insight Agent                             │
      │       ├── Statistical variance vs. baseline            │
      │       └── Category budget impact                       │
      │  5. Recommendation Agent                               │
      │       ├── Safe / Review / High Risk synthesis          │
      │       └── Actionable advisory guidance                 │
      │  6. Explainability Agent                               │
      │       ├── Plain-English "Why am I seeing this?"        │
      │       └── Multi-factor breakdown                       │
      └───────────────────────────┬────────────────────────────┘
                                  │
                        Returns Structured JSON
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │     User Decision Gate     │
                    │ (Proceed / Review / Cancel)│
                    └─────────────┬──────────────┘
                                  │
                       POST /api/payment/create-order
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │      Payment Gateway       │
                    │  ├── PayPal Sandbox REST   │
                    │  └── Zero-Config Demo Mode │
                    └────────────────────────────┘
```

---

## Technical Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (Fintech UI icons), Recharts (data visualizations).
- **Backend**: Python 3.10+, FastAPI (Async REST API), Pydantic v2 (Input validation & agent schemas), SQLAlchemy 2.0 (ORM).
- **Database**: SQLite with thread-safe connection pooling, pre-seeded with 32 realistic synthetic transactions across categories.
- **AI Core**: Dual-mode intelligent architecture:
  - *Mode A*: Google Gemini API via REST with structured JSON response schema (when `GEMINI_API_KEY` is provided).
  - *Mode B*: Built-in Autonomous Heuristic AI Engine (zero-config, runs offline with contextual NLP, anomaly math, and duplicate scanning).
- **Payment Processing**:
  - *Live Sandbox*: Official PayPal Sandbox REST API (`/v2/checkout/orders` and `/v2/checkout/orders/{id}/capture`).
  - *Demo Mode*: Built-in high-fidelity mock engine for frictionless offline judging and evaluation.

---

## Database Schema

### 1. `users`
- `id`: String (UUID)
- `username`: String
- `email`: String
- `created_at`: DateTime

### 2. `transactions`
- `id`: String (`TX-XXXXXX`)
- `user_id`: ForeignKey(`users.id`)
- `merchant`: String
- `merchant_email`: String (optional)
- `amount`: Float
- `currency`: String (USD, EUR, GBP, INR)
- `category`: String (Food, Shopping, Travel, Bills, Education, Entertainment, Services, Other)
- `description`: String
- `purpose`: String
- `notes`: Text
- `risk_score`: Integer (0-100)
- `risk_level`: String (`LOW`, `MEDIUM`, `HIGH`)
- `ai_recommendation`: String (`SAFE TO PROCEED`, `REVIEW RECOMMENDED`, `HIGH RISK`)
- `paypal_order_id`: String (nullable)
- `paypal_capture_id`: String (nullable)
- `payment_status`: String (`PENDING`, `COMPLETED`, `CANCELLED`, `FLAGGED`)
- `mode`: String (`DEMO` or `PAYPAL_SANDBOX`)
- `created_at`: DateTime

### 3. `risk_assessments`
- `id`: String (UUID)
- `transaction_id`: ForeignKey(`transactions.id`)
- `risk_score`: Integer
- `risk_level`: String
- `recommendation`: String
- `confidence`: Float
- `reasons_json`: Text (JSON string)
- `created_at`: DateTime

### 4. `agent_results`
- `id`: String (UUID)
- `transaction_id`: ForeignKey(`transactions.id`)
- `agent_name`: String
- `status`: String (`SUCCESS`, `WARNING`, `ALERT`)
- `output_data_json`: Text (JSON string)
- `execution_time_ms`: Float
- `created_at`: DateTime

### 5. `payment_events`
- `id`: String (UUID)
- `transaction_id`: ForeignKey(`transactions.id`)
- `event_type`: String (`ANALYZED`, `ORDER_CREATED`, `CAPTURED`, `CANCELLED`)
- `payload_json`: Text (JSON string)
- `created_at`: DateTime
