# PayPilot AI - Hackathon Demo & Evaluation Guide

## Quick Demo Video Script (2-3 Minutes)

This guide provides hackathon evaluators with a 4-step walkthrough demonstrating the multi-agent payment intelligence system.

---

### Step 1: Landing Page & Architectural Overview
1. Open the application at `http://localhost:5173`.
2. Notice the sleek fintech dark/light theme, custom PayPilot logo, and environment badge (`DEMO MODE` or `PAYPAL SANDBOX`).
3. Scroll through the **6 Specialized Agents** grid and the **Decision Journey** workflow.
4. Click **"Try PayPilot"** or navigate to **"New Payment"**.

---

### Step 2: Test Scenario 1 - Safe Routine Grocery Payment (Low Risk)
1. On the **New Payment** screen, click the **"Hackathon Demo Presets"** dropdown.
2. Select **"🟢 Safe Scenario: Routine Grocery ($42.50)"**.
3. Notice the form autofills:
   - Merchant: `FreshMart`
   - Amount: `$42.50`
   - Category: `Food`
   - Description: `Weekly organic groceries and fruits`
4. Click **"Analyze Payment with AI"**.
5. Watch the **6-Agent Pipeline Visualizer** execute sequentially:
   - *Transaction Understanding Agent* validates category.
   - *Risk Analysis Agent* calculates score.
   - *Fraud Signal Agent* confirms zero duplicates.
   - *Spending Insight Agent* verifies baseline proximity.
   - *Recommendation Agent* generates `SAFE TO PROCEED`.
   - *Explainability Agent* compiles human-readable factors.
6. Expand **"Why did PayPilot give this result?"** to view the 5-factor breakdown.
7. Click **"Proceed to Pay with PayPal"**.
8. Observe the **Payment Successful** confirmation with transaction ID and PayPal capture ID.

---

### Step 3: Test Scenario 2 - Duplicate Payment Detection (Review Recommended)
1. Click **"New Payment"**.
2. In the presets dropdown, select **"🟡 Review Scenario: Duplicate Coffee Charge ($24.50)"**.
3. Click **"Analyze Payment with AI"**.
4. Observe the assessment:
   - Recommendation: `REVIEW RECOMMENDED`.
   - Fraud Signal Agent detects a previous charge of $24.50 to `CloudCafe` within the 48-hour history.
   - "Why am I seeing this?" alerts the user to potential accidental double billing.
5. Demonstrate user agency by clicking **"Cancel Payment"**. Notice the system cleanly records the user's conscious safety decision.

---

### Step 4: Test Scenario 3 - Urgent Wire Transfer Anomaly (High Risk)
1. Click **"New Payment"**.
2. In presets, select **"🔴 High Risk Scenario: Urgent Offshore Wire ($3,500.00)"**.
3. Click **"Analyze Payment with AI"**.
4. Notice the system response:
   - Risk Score: `85-95/100` (`HIGH RISK`).
   - Transaction Understanding Agent flags high-pressure urgency keywords (`immediately`, `urgent`).
   - Risk Analysis Agent detects an extreme amount spike (>10x baseline) and disposable email provider (`tempmail.xyz`).
   - Recommendation: `HIGH RISK` with prudent advisory steps.
5. Click **"View AI Agent Telemetry"** to inspect the full structured JSON payload returned by the multi-agent engine.

---

### Step 5: AI Insights & Audit Trail
1. Navigate to **"AI Insights"**:
   - View dynamic category spending distribution chart (Recharts).
   - View monthly billing volume trends.
   - Inspect AI-detected unusual transactions.
2. Navigate to **"Transactions"**:
   - Filter by risk level (`Low`, `Medium`, `High`) and status (`Completed`, `Cancelled`).
   - Search by merchant name (`FreshMart`, `CloudCafe`, `Escrow`).
   - Click any transaction to open the comprehensive audit ledger and agent output modal.
