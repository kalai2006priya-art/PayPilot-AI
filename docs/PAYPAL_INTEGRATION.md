# PayPilot AI - PayPal Sandbox Integration Guide

## Overview
PayPilot AI integrates with the official **PayPal Sandbox REST API v2**. It also features an automated **Zero-Config Demo Mode** so that hackathon judges, educators, and developers can test the application without needing to create or supply PayPal Sandbox credentials.

---

## 1. Environment Configuration

To connect live to the PayPal Sandbox:
1. Create a developer account at [developer.paypal.com](https://developer.paypal.com/).
2. Navigate to **Dashboard > Apps & Credentials > Sandbox**.
3. Create a sandbox app or copy credentials from the Default Application.
4. Copy `.env.example` to `.env` in the root folder:
   ```env
   PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
   PAYPAL_ENVIRONMENT=sandbox
   ```

---

## 2. Zero-Config Demo Mode

If `PAYPAL_CLIENT_ID` or `PAYPAL_CLIENT_SECRET` are left blank or unset:
- PayPilot AI automatically runs in **DEMO MODE**.
- The navigation bar displays an amber `DEMO MODE` badge.
- Order creation generates valid mock orders with IDs such as `MOCK-ORD-ABC12345`.
- Order capture completes instantly and outputs realistic capture IDs (`MOCK-CAP-XYZ98765`).
- No external HTTP requests to PayPal servers are made, guaranteeing zero failure during offline demos.

When valid credentials are added to `.env`:
- The backend automatically switches to **PAYPAL SANDBOX**.
- The navigation bar updates to a green `PAYPAL SANDBOX` pill with a pulsing live status dot.

---

## 3. PayPal Sandbox REST API Workflow

### A. OAuth 2.0 Token Generation
- Endpoint: `POST https://api-m.sandbox.paypal.com/v1/oauth2/token`
- Headers: `Authorization: Basic <base64(client_id:client_secret)>`
- Body: `grant_type=client_credentials`

### B. Order Creation (`POST /api/payment/create-order`)
- Endpoint: `POST https://api-m.sandbox.paypal.com/v2/checkout/orders`
- Payload:
  ```json
  {
    "intent": "CAPTURE",
    "purchase_units": [
      {
        "amount": {
          "currency_code": "USD",
          "value": "42.50"
        },
        "description": "Weekly organic groceries"
      }
    ],
    "application_context": {
      "brand_name": "PayPilot AI",
      "user_action": "PAY_NOW"
    }
  }
  ```

### C. Order Capture (`POST /api/payment/capture-order`)
- Endpoint: `POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{id}/capture`
- Updates transaction status in the SQLite database to `COMPLETED` and logs the PayPal Capture ID.
