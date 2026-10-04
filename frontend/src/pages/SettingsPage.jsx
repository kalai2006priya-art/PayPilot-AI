import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Database, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Key,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

export default function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getAgentsStatus();
      setSystemStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReseed = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const res = await api.reseedData();
      setSeedMessage(res.message || 'Synthetic database reset with 32 realistic transactions!');
      setTimeout(() => setSeedMessage(''), 4000);
    } catch (err) {
      setSeedMessage('Failed to reset demo data.');
    } finally {
      setSeeding(false);
    }
  };

  const isPayPalConfigured = systemStatus?.paypal_mode === 'PAYPAL_SANDBOX';
  const isGeminiConfigured = systemStatus?.ai_provider === 'GEMINI_API';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          System Configuration & Gateway Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review integration credentials, active AI models, and demo data presets
        </p>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PayPal Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">PayPal Gateway</h3>
                <span className="text-[10px] text-slate-400">Payment Processor</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isPayPalConfigured
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}
            >
              {systemStatus?.paypal_mode || 'DEMO_MODE'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isPayPalConfigured
              ? 'Connected to live PayPal Sandbox REST API endpoints for order generation and capture.'
              : 'Zero-config Demo Mode active. Uses high-fidelity mock order and capture receipts.'}
          </p>

          <div className="pt-2 text-[11px] text-slate-400">
            Configure in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">.env</code> via <code className="font-mono">PAYPAL_CLIENT_ID</code>.
          </div>
        </div>

        {/* AI Engine Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Engine</h3>
                <span className="text-[10px] text-slate-400">Agent Intelligence Provider</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isGeminiConfigured
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-teal-500/10 text-teal-500 border-teal-500/20'
              }`}
            >
              {systemStatus?.ai_provider || 'AUTONOMOUS_HEURISTIC_ENGINE'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isGeminiConfigured
              ? 'Connected to Google Gemini 1.5 Flash via REST API with structured JSON output.'
              : 'Built-in deterministic contextual engine executing multi-agent reasoning offline.'}
          </p>

          <div className="pt-2 text-[11px] text-slate-400">
            Configure in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">.env</code> via <code className="font-mono">GEMINI_API_KEY</code>.
          </div>
        </div>
      </div>

      {/* Agents Operational Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Micro-Agent Registry</h3>
            <p className="text-xs text-slate-400">Live operational status of the 6 agent modules</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            6 of 6 Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {systemStatus?.agents?.map((ag) => (
            <div key={ag.agent_id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">{ag.name}</span>
                <p className="text-[11px] text-slate-400">{ag.role}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] text-slate-400">{ag.model}</span>
                <div className="text-emerald-500 font-bold text-[10px]">● {ag.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            Hackathon Demo Data Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reset or re-seed the SQLite database with 32 realistic synthetic transactions across all categories and risk profiles.
          </p>
        </div>

        <button
          onClick={handleReseed}
          disabled={seeding}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Resetting Data...' : 'Reset Demo Data'}
        </button>
      </div>
    </div>
  );
}
