const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getAgentsStatus() {
    const res = await fetch(`${API_BASE}/agents/status`);
    if (!res.ok) throw new Error('Failed to fetch agent statuses');
    return res.json();
  },

  async analyzePayment(paymentData) {
    const res = await fetch(`${API_BASE}/payment/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
      throw new Error(err.detail || 'Failed to analyze payment');
    }
    return res.json();
  },

  async createOrder(transactionId) {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId })
    });
    if (!res.ok) throw new Error('Failed to create PayPal order');
    return res.json();
  },

  async captureOrder(transactionId, orderId) {
    const res = await fetch(`${API_BASE}/payment/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId, paypal_order_id: orderId })
    });
    if (!res.ok) throw new Error('Failed to capture PayPal payment');
    return res.json();
  },

  async cancelPayment(transactionId) {
    const res = await fetch(`${API_BASE}/payment/${transactionId}/cancel`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to cancel transaction');
    return res.json();
  },

  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.risk_level) query.append('risk_level', params.risk_level);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    
    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load transactions');
    return res.json();
  },

  async getTransactionDetails(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`);
    if (!res.ok) throw new Error('Failed to load transaction details');
    return res.json();
  },

  async getInsights() {
    const res = await fetch(`${API_BASE}/insights`);
    if (!res.ok) throw new Error('Failed to load insights data');
    return res.json();
  },

  async reseedData() {
    const res = await fetch(`${API_BASE}/seed?force=true`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  }
};
