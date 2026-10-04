# PayPilot AI - Multi-Agent Engine Specification

## The Philosophy of Agentic Payment Intelligence
A single monolithic Large Language Model is poorly suited for mission-critical fintech security:
1. It is prone to statistical hallucinations.
2. It lacks deterministic mathematical rigor (such as duplicate charge intervals and percentage deviation arithmetic).
3. It creates an opaque "black-box" decision that frustrates consumers.

PayPilot solves this through the **PayPilot Multi-Agent Payment Intelligence Engine**, decomposing payment safety into 6 specialized micro-agents exchanging strictly validated JSON schemas.

---

## Agent Specifications

### 1. Transaction Understanding Agent
- **Purpose**: Parses semantic payment parameters, detects social engineering or urgent language, and verifies category consistency.
- **Inputs**: Amount, currency, merchant name, category, description, purpose, notes.
- **Outputs**:
  - `detected_intent`: Clean synthesized user intent.
  - `category_match`: Boolean indicating whether description matches the category.
  - `urgency_detected`: Boolean flag for pressure keywords ("urgent", "immediately", "wire fast", "penalty", "lottery", "crypto", "ransom").
  - `unusual_characteristics`: Array of detected anomalies in phrasing.
- **Safety Directive**: Only use provided transaction details; never invent external facts.

### 2. Risk Analysis Agent
- **Purpose**: Calculates an objective 0-100 risk score and assigns a risk tier (`LOW`, `MEDIUM`, `HIGH`).
- **Inputs**: Transaction details, historical user baseline average, understanding agent output, time of transaction.
- **Evaluation Rules**:
  - *Amount Ratio*: Adds risk if amount is 3x or 10x higher than typical baseline.
  - *Contextual Pressure*: Increases score if high-urgency keywords or mismatched categories are detected.
  - *Off-Peak Hours*: Flags atypical early-morning transactions (1:00 AM - 4:00 AM UTC).
  - *Untrusted Domains*: Identifies disposable/tempmail domains in merchant contacts.

### 3. Fraud Signal Agent
- **Purpose**: Identifies rapid velocity anomalies, duplicate billing charges, and unverified merchant patterns.
- **Inputs**: Current payment parameters and the user's recent 48-hour transaction history.
- **Evaluation Rules**:
  - *Duplicate Detection*: Scans for identical merchant and amount within recent history (detects double-taps and accidental subscriptions).
  - *Velocity Amount Spike*: Evaluates abrupt spending shifts (>4x average).
  - *High-Frequency Merchant Velocity*: Flags rapid repeated requests to the same merchant within minutes.

### 4. Spending Insight Agent
- **Purpose**: Delivers financial benchmarking and personal spending context.
- **Inputs**: Transaction amount, category, user baseline average ($85.00), category historical averages.
- **Outputs**:
  - `current_vs_avg_percentage`: Exact variance percentage (+35%, -12%).
  - `monthly_budget_impact`: Qualitative projection of monthly budget consumption.
  - `spending_trend`: `STEADY`, `INCREASING`, or `SPIKE`.

### 5. Recommendation Agent
- **Purpose**: Combines findings from Agents 1–4 into an actionable advisory assessment.
- **Output Tiers**:
  - `SAFE TO PROCEED`: Routine payment, verified merchant, normal amounts.
  - `REVIEW RECOMMENDED`: Variance in amount, moderate spike, or potential duplicate.
  - `HIGH RISK`: Significant risk signals, disposable domain, or urgent wire pressure.
- **Core Requirement**: Strictly presented as an *informational recommendation*. The user retains 100% decision authority.

### 6. Explainability Agent
- **Purpose**: Converts complex telemetry, risk scores, and mathematical variances into natural human language.
- **Outputs**:
  - `human_summary`: 1-2 sentence conversational brief.
  - `why_see_this`: Bullet points explaining the decision factors.
  - `breakdown_factors`: Structured criteria cards (Amount Analysis, Merchant Analysis, Duplicate Detection, Timing Analysis, Spending Pattern).
  - `disclaimer`: Explicit notice that AI advises and user decides.
