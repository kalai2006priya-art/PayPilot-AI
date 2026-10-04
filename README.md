# PayPilot AI: Agentic AI Payment Safety & Decision Assistant
> **Built for the PayPal AI Hackathon 2026**  
> *Transforming transaction execution into an explainable, multi-agent intelligence experience.*

---

## 🌟 Executive Summary

Traditional payment processors act as passive execution pipes: once a user clicks "Pay", the funds move immediately regardless of whether the transaction is an accidental duplicate, an out-of-character spending spike, or an urgent social engineering attack.

**PayPilot AI** revolutionizes payment safety through an **Agentic Multi-Agent Intelligence Engine**. Before a single cent is committed, a pipeline of 6 specialized AI micro-agents evaluates the transaction context, analyzes mathematical risk, checks for duplicates, compares against historical habits, and generates human-readable explanations.

Crucially, **the user remains in complete control**. PayPilot provides transparent risk recommendations (`SAFE TO PROCEED`, `REVIEW RECOMMENDED`, `HIGH RISK`), allowing the user to approve or cancel with full context before submitting the order to **PayPal Sandbox**.

---

## 🚀 Key Features

- **Sequential 6-Agent AI Architecture**:
  1. **Transaction Understanding Agent**: Extracts intent, validates category alignment, and checks for pressure/urgency cues.
  2. **Risk Analysis Agent**: Computes an objective 0–100 risk score based on statistical thresholds and transaction timing.
  3. **Fraud Signal Agent**: Scans recent 48-hour history for duplicate amounts, rapid velocity spikes, and unverified merchant domains.
  4. **Spending Insight Agent**: Benchmarks the current purchase against personal spending baselines (+% deviation, monthly budget impact).
  5. **Recommendation Agent**: Synthesizes multi-agent signals into clear advisory guidance while respecting user autonomy.
  6. **Explainability Agent**: Converts raw machine learning scores into conversational bullet points answering *"Why am I seeing this?"*.
- **Interactive Multi-Agent Visualizer**: Step-by-step sequential animation showing the status and execution latency (in ms) of each micro-agent.
- **Official PayPal Sandbox Integration**: Real REST API v2 order creation and capture endpoints (`/v2/checkout/orders`).
- **Zero-Config Demo Mode**: Automatically detects missing PayPal or Gemini API keys and seamlessly switches to a high-fidelity Demo Mode so judges and developers can test the entire application out-of-the-box.
- **Fintech UI/UX**: Built with React, Vite, and Tailwind CSS with dark/light mode toggle, custom SVG branding, responsive layout, and Recharts analytics.
- **Pre-Seeded Synthetic Dataset**: 32 realistic synthetic transactions across categories (`Food`, `Shopping`, `Travel`, `Bills`, `Education`, `Entertainment`, `Services`) providing instant rich analytics.

---

## 📂 Project Structure

```
PayPilot-AI/
├── backend/
│   ├── app/
│   │   ├── core/           # Settings & .env loading
│   │   ├── database/       # SQLAlchemy models & SQLite session
│   │   ├── schemas/        # Pydantic schemas for requests & agents
│   │   ├── agents/         # 6 Specialized micro-agents & Orchestrator
│   │   ├── services/       # PayPal REST client & transaction analytics
│   │   ├── api/            # FastAPI REST endpoints
│   │   └── main.py         # App entrypoint with auto-seeding
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Visualizer, Assessment Card, Navbar, Logo
│   │   ├── pages/          # Landing, Dashboard, New Payment, Transactions, Insights
│   │   ├── services/       # Frontend API client
│   │   ├── context/        # ThemeContext (Dark/Light mode)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── data/                   # SQLite database directory (auto-created)
├── docs/
│   ├── ARCHITECTURE.md     # In-depth architectural data flow
│   ├── AI_AGENTS.md        # Deep dive into all 6 micro-agents
│   ├── PAYPAL_INTEGRATION.md # PayPal Sandbox setup guide
│   └── DEMO_GUIDE.md       # Step-by-step hackathon judging script
│
├── run_backend.bat         # 1-Click backend launcher
├── run_frontend.bat        # 1-Click frontend launcher
├── start_all.bat           # 1-Click system startup script
├── .env.example            # Environment variables template
├── .gitignore
├── LICENSE                 # MIT License
└── README.md
```

---

## ⚡ Quick Start Guide (Beginner Friendly)

### Option 1: 1-Click Startup (Recommended)
Simply double-click **`start_all.bat`** in the project root!  
This script will:
1. Start the FastAPI backend on `http://127.0.0.1:8000`.
2. Start the Vite React frontend on `http://localhost:5173`.
3. Open PayPilot AI directly in your web browser.

---

### Option 2: Running from VS Code Terminal

#### Terminal 1 — Backend (Python):
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend is live at:* `http://127.0.0.1:8000` (Swagger interactive docs at `/docs`)

#### Terminal 2 — Frontend (Node.js):
```powershell
cd frontend
npm run dev
```
*Frontend is live at:* `http://localhost:5173`

---

## 🔑 Environment Configuration (`.env`)

PayPilot works **out-of-the-box in Demo Mode** with zero configuration required.

To connect live to **PayPal Sandbox** or **Google Gemini AI**:
1. Copy `.env.example` to `.env` in the project root:
   ```powershell
   copy .env.example .env
   ```
2. Fill in your credentials:
   ```env
   # PayPal Sandbox Credentials (from developer.paypal.com)
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_ENVIRONMENT=sandbox

   # Optional: Google Gemini API Key (from aistudio.google.com)
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Restart the backend. The badge on the navigation bar will automatically switch from `DEMO MODE` to `PAYPAL SANDBOX`.

---

## 🧪 Ready-To-Test Scenarios (1-Click Presets)

On the **New Payment** page, use the **Hackathon Demo Presets** dropdown to test:
1. **🟢 Safe Scenario (Routine Grocery $42.50)**:
   - Expected Output: `SAFE TO PROCEED` (Risk Score: 10–20).
   - Validates routine merchant and baseline spending range.
2. **🟡 Review Scenario (Duplicate Coffee $24.50)**:
   - Expected Output: `REVIEW RECOMMENDED` (Risk Score: 40–65).
   - Flags an identical recent charge to `CloudCafe` to prevent duplicate billing.
3. **🔴 High Risk Scenario (Urgent Offshore Wire $3,500.00)**:
   - Expected Output: `HIGH RISK` (Risk Score: 85–95).
   - Detects extreme amount spike (>10x baseline), urgency keywords, and temporary email domain.
4. **🟢 Moderate Scenario (TypeScript Bootcamp $89.00)**:
   - Expected Output: `SAFE TO PROCEED` (Education category).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & mode indicator (`DEMO_MODE` or `PAYPAL_SANDBOX`) |
| `GET` | `/api/agents/status` | Operational status and telemetry of all 6 agents |
| `POST` | `/api/payment/analyze` | Executes the 6-agent sequential intelligence pipeline |
| `POST` | `/api/payment/create-order` | Creates PayPal Sandbox Order (or Mock order) |
| `POST` | `/api/payment/capture-order` | Captures authorized payment and updates database |
| `POST` | `/api/payment/{id}/cancel` | Marks transaction as user-cancelled |
| `GET` | `/api/transactions` | Filterable, searchable audit ledger |
| `GET` | `/api/transactions/{id}` | Detailed telemetry and agent breakdown for a transaction |
| `GET` | `/api/insights` | Category breakdowns, monthly spend, and risk metrics |
| `POST` | `/api/seed` | Reseeds synthetic database with 32 demo transactions |

---

## 🛡️ Responsible AI & Ethical Design

- **User Agency**: The AI *never* executes financial transfers unilaterally. The user explicitly approves or cancels every transaction.
- **Informational Advisory Notice**: Every assessment includes a clear disclaimer that PayPilot AI produces predictive assessments, not financial guarantees.
- **Strict Data Privacy**: API secrets and sandbox credentials are never exposed to the client or committed to version control (`.env` in `.gitignore`).

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
