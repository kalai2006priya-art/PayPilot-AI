import React, { useState } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import AgentPipelineVisualizer from '../components/AgentPipelineVisualizer';
import RiskAssessmentCard from '../components/RiskAssessmentCard';
import RiskExplanationModal from '../components/RiskExplanationModal';

const CATEGORIES = [
  'Food',
  'Shopping',
  'Travel',
  'Bills',
  'Education',
  'Entertainment',
  'Services',
  'Other'
];

const PRESET_SCENARIOS = [
  {
    name: '🟢 Safe Scenario: Routine Grocery ($42.50)',
    data: {
      amount: 42.50,
      currency: 'USD',
      merchant: 'FreshMart',
      merchant_email: 'billing@freshmart.com',
      category: 'Food',
      description: 'Weekly organic groceries and fruits',
      purpose: 'Personal household groceries',
      notes: 'Standard weekly routine purchase'
    }
  },
  {
    name: '🟡 Review Scenario: Duplicate Coffee Charge ($24.50)',
    data: {
      amount: 24.50,
      currency: 'USD',
      merchant: 'CloudCafe',
      merchant_email: 'pay@cloudcafe.net',
      category: 'Food',
      description: 'Brunch meeting and espresso',
      purpose: 'Team snack meeting',
      notes: 'Possible accidental double swipe'
    }
  },
  {
    name: '🔴 High Risk Scenario: Urgent Offshore Wire ($3,500.00)',
    data: {
      amount: 3500.00,
      currency: 'USD',
      merchant: 'Unknown Escrow Ltd',
      merchant_email: 'wire-fast@tempmail.xyz',
      category: 'Services',
      description: 'URGENT offshore crypto investment claim release immediately',
      purpose: 'Emergency prize release wire',
      notes: 'Sender claimed penalty if not wired within 10 minutes'
    }
  },
  {
    name: '🟢 Moderate Scenario: Online TypeScript Course ($89.00)',
    data: {
      amount: 89.00,
      currency: 'USD',
      merchant: 'EduLearn',
      merchant_email: 'tuition@edulearn.org',
      category: 'Education',
      description: 'Full stack development bootcamp module',
      purpose: 'Professional skill training',
      notes: 'Approved course enrollment'
    }
  }
];

export default function NewPaymentPage({ setActiveTab }) {
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    merchant: '',
    merchant_email: '',
    category: 'Shopping',
    description: '',
    purpose: '',
    notes: ''
  });

  // Flow State: 'FORM' | 'ANALYZING' | 'ASSESSMENT' | 'PAYING' | 'SUCCESS' | 'CANCELLED'
  const [flowState, setFlowState] = useState('FORM');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  // Load Preset
  const handleSelectPreset = (e) => {
    const selected = PRESET_SCENARIOS.find((s) => s.name === e.target.value);
    if (selected) {
      setFormData(selected.data);
      setErrorMsg('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Trigger AI Analysis
  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than zero.');
      return;
    }
    if (!formData.merchant.trim()) {
      setErrorMsg('Merchant name is required.');
      return;
    }

    setErrorMsg('');
    setFlowState('ANALYZING');

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        merchant: formData.merchant.trim(),
        merchant_email: formData.merchant_email.trim() || undefined,
        category: formData.category,
        description: formData.description.trim(),
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim()
      };

      const result = await api.analyzePayment(payload);
      setAnalysisResult(result);
      // Flow remains 'ANALYZING' until visualizer finishes animation
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'AI analysis failed. Please review your input.');
      setFlowState('FORM');
    }
  };

  // 2. Proceed to Pay via PayPal Sandbox / Demo
  const handleProceedToPay = async () => {
    if (!analysisResult?.transaction_id) return;
    setFlowState('PAYING');
    setErrorMsg('');

    try {
      // Step A: Create PayPal Order
      const order = await api.createOrder(analysisResult.transaction_id);

      // Step B: Capture Order
      const capture = await api.captureOrder(analysisResult.transaction_id, order.order_id);
      
      setPaymentResult(capture);
      setFlowState('SUCCESS');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Payment execution failed');
      setFlowState('ASSESSMENT');
    }
  };

  // 3. User cancels
  const handleCancelPayment = async () => {
    if (analysisResult?.transaction_id) {
      try {
        await api.cancelPayment(analysisResult.transaction_id);
      } catch (e) {
        // ignore
      }
    }
    setFlowState('CANCELLED');
  };

  const handleReset = () => {
    setFormData({
      amount: '',
      currency: 'USD',
      merchant: '',
      merchant_email: '',
      category: 'Shopping',
      description: '',
      purpose: '',
      notes: ''
    });
    setAnalysisResult(null);
    setPaymentResult(null);
    setFlowState('FORM');
    setErrorMsg('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Intelligent Payment Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
          Every payment is vetted by 6 autonomous AI agents before any funds are committed through PayPal.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE 1: FORM */}
      {flowState === 'FORM' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {/* Quick Preset Selector */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Hackathon Demo Presets (1-Click Test Scenarios)
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <select
              onChange={handleSelectPreset}
              defaultValue=""
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>-- Select a test scenario --</option>
              {PRESET_SCENARIOS.map((s, idx) => (
                <option key={idx} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleStartAnalysis} className="space-y-5">
            {/* Amount & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Payment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            {/* Merchant Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Merchant Name *
                </label>
                <input
                  type="text"
                  name="merchant"
                  value={formData.merchant}
                  onChange={handleInputChange}
                  placeholder="e.g. FreshMart, TechWorld"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Merchant Contact Email (Optional)
                </label>
                <input
                  type="email"
                  name="merchant_email"
                  value={formData.merchant_email}
                  onChange={handleInputChange}
                  placeholder="billing@merchant.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Category & Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Payment Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Payment Purpose
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="e.g. Household supplies, SaaS license"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Description & Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Payment Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief summary of items or services"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Additional Notes (Analyzed by Intent Agent)
              </label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special terms, urgency notes, or context"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Payment with AI
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2.5">
                This triggers the 6-agent intelligence pipeline. No funds will be charged.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* STAGE 2: PIPELINE VISUALIZATION & ASSESSMENT */}
      {(flowState === 'ANALYZING' || flowState === 'ASSESSMENT' || flowState === 'PAYING') && (
        <div className="space-y-6">
          {/* Animated Pipeline */}
          <AgentPipelineVisualizer
            isAnalyzing={flowState === 'ANALYZING'}
            pipelineData={analysisResult}
            onComplete={() => setFlowState('ASSESSMENT')}
          />

          {/* Assessment Result (visible after animation or when ready) */}
          {flowState === 'ASSESSMENT' && analysisResult && (
            <div className="animate-fadeIn space-y-4">
              <RiskAssessmentCard
                assessmentData={analysisResult}
                onProceed={handleProceedToPay}
                onCancel={handleCancelPayment}
                onOpenDetails={() => setShowTelemetryModal(true)}
              />

              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start another payment
                </button>
              </div>
            </div>
          )}

          {flowState === 'PAYING' && (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Connecting to PayPal Sandbox Gateway...
              </h3>
              <p className="text-xs text-slate-400">
                Authorizing and capturing order receipt.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3: PAYMENT SUCCESS */}
      {flowState === 'SUCCESS' && paymentResult && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/30 p-8 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {paymentResult.mode === 'PAYPAL_SANDBOX' ? 'PayPal Sandbox Payment Confirmed' : 'Demo Payment Simulation Complete'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Payment Successful
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your transaction was audited by PayPilot AI and captured securely.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-left space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{paymentResult.transaction_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PayPal Capture ID:</span>
              <span className="font-mono font-bold text-emerald-500">{paymentResult.paypal_capture_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Merchant:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.merchant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Paid:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {paymentResult.currency} ${parseFloat(paymentResult.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-500">{paymentResult.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowTelemetryModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              View AI Agent Telemetry
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              New Payment
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: USER CANCELLED */}
      {flowState === 'CANCELLED' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-md text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <RotateCcw className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Payment Cancelled
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You chose to cancel this transaction following the AI risk assessment. No money was transferred.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Start Another Payment
            </button>
          </div>
        </div>
      )}

      {/* Telemetry Modal */}
      <RiskExplanationModal
        isOpen={showTelemetryModal}
        onClose={() => setShowTelemetryModal(false)}
        transactionData={analysisResult}
      />
    </div>
  );
}
