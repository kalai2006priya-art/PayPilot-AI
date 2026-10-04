import React from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowDown, 
  FileText, 
  ShieldAlert, 
  Fingerprint, 
  TrendingUp, 
  MessageSquareQuote,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function HowItWorksPage() {
  const agentDetails = [
    {
      num: 1,
      name: "Transaction Understanding Agent",
      input: "Amount, Currency, Merchant Name, Category, Description, Stated Purpose, User Notes",
      output: "Structured Intent, Verified Category Alignment, Urgency Keyword Flags",
      why: "Catches social engineering, emergency wire phrasing, and mismatches between the category (e.g. 'Bills') and actual payment contents (e.g. 'crypto release').",
      icon: FileText
    },
    {
      num: 2,
      name: "Risk Analysis Agent",
      input: "Transaction Context, Off-Peak Time Benchmark, Mathematical Thresholds",
      output: "Objective Risk Score (0-100), Risk Level (LOW, MEDIUM, HIGH), Explicit Risk Factors",
      why: "Quantifies deviation severity, off-peak timing (1:00 AM - 4:00 AM), and elevated risk factors into an interpretable metric.",
      icon: ShieldAlert
    },
    {
      num: 3,
      name: "Fraud Signal Agent",
      input: "Recent 48-Hour Transaction History, Merchant Identity, Amount Velocity",
      output: "Duplicate Charges Detected, Velocity Spike Signals, Disposable Domain Warnings",
      why: "Prevents accidental double-clicks, duplicate billing subscriptions, and interactions with known temporary remittance domains.",
      icon: Fingerprint
    },
    {
      num: 4,
      name: "Spending Insight Agent",
      input: "Historical Consumer Spending Profile, Category Averages",
      output: "Current vs Average Percentage Variance (+35%, -15%), Monthly Budget Impact",
      why: "Provides financial context. A $500 purchase might be completely routine for travel, but an extreme anomaly for daily coffee.",
      icon: TrendingUp
    },
    {
      num: 5,
      name: "Recommendation Agent",
      input: "Consolidated Outputs from Agents 1 through 4",
      output: "Advisory Guidance ('SAFE TO PROCEED', 'REVIEW RECOMMENDED', 'HIGH RISK'), Confidence Rating",
      why: "Synthesizes multi-agent signals into clear, actionable advice while strictly preserving user autonomy. The AI advises; you decide.",
      icon: Sparkles
    },
    {
      num: 6,
      name: "Explainability Agent",
      input: "Mathematical Vectors & Raw Telemetry from all previous agents",
      output: "Plain-English Bullet Points ('Why am I seeing this?'), Factor-by-Factor Breakdown",
      why: "Eliminates black-box opacity. Instead of 'anomaly_score: 0.82', you see 'Your payment is 8% above your recent average and merchant details are complete.'",
      icon: MessageSquareQuote
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
          Architecture & Agentic Theory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          How PayPilot AI Protects Every Payment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Traditional payment systems process requests blindly. PayPilot introduces an autonomous Multi-Agent Intelligence Engine that reasons before execution.
        </p>
      </div>

      {/* Visual Pipeline Flow Chart */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
          Architectural Data Pipeline
        </h3>

        <div className="flex flex-col items-center space-y-3 max-w-md mx-auto">
          {/* Node: User */}
          <div className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            👤 User Initiates Payment Request
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Node: Orchestrator */}
          <div className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20">
            ⚡ Central Multi-Agent Orchestrator
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Subgraph: 6 Agents */}
          <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-emerald-500/40 text-left space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block text-center">
              Specialized Agent Consensus Layer
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                1. Transaction Agent
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                2. Risk Agent (0-100)
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                3. Fraud Signal Agent
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                4. Spending Agent
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                5. Recommendation Agent
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                6. Explainability Agent
              </div>
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Node: Transparent Assessment */}
          <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            📊 Transparent AI Assessment & Explanations
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Node: User Decision */}
          <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
            🛡️ User Decision: Proceed, Review, or Cancel
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Node: PayPal Sandbox */}
          <div className="w-full p-3.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20">
            💳 PayPal Sandbox REST Order Creation & Capture
          </div>
        </div>
      </div>

      {/* Deep-dive into each agent */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Deep Dive: The 6 Specialized Agents
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Designed to produce structured JSON and prevent artificial intelligence hallucinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentDetails.map((ag) => {
            const Icon = ag.icon;
            return (
              <div
                key={ag.num}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Agent #{ag.num}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ag.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ag.why}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                  <div>
                    <span className="text-slate-400 font-semibold">Inputs: </span>
                    <span className="text-slate-600 dark:text-slate-300">{ag.input}</span>
                  </div>
                  <div>
                    <span className="text-emerald-500 font-semibold">Output: </span>
                    <span className="text-slate-700 dark:text-slate-200">{ag.output}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
