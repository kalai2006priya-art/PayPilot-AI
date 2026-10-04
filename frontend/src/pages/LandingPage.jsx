import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Layers, 
  FileText, 
  ShieldAlert, 
  Fingerprint, 
  TrendingUp, 
  MessageSquareQuote,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import Logo from '../components/Logo';

export default function LandingPage({ setActiveTab }) {
  const agentCards = [
    {
      title: 'Transaction Intelligence',
      role: 'Context Extraction & Intent',
      desc: 'Parses merchant identity, validates category alignment, and inspects notes for subtle high-pressure urgency cues.',
      icon: FileText,
      color: 'from-blue-500/20 to-cyan-500/20',
      textColor: 'text-blue-500'
    },
    {
      title: 'Risk Analysis',
      role: '0-100 Dynamic Risk Scoring',
      desc: 'Evaluates transaction timing, off-peak hours, and extreme amount spikes against mathematical safety thresholds.',
      icon: ShieldAlert,
      color: 'from-amber-500/20 to-orange-500/20',
      textColor: 'text-amber-500'
    },
    {
      title: 'Fraud Signals',
      role: 'Duplicate & Velocity Anomaly',
      desc: 'Instantly identifies accidental double charges, rapid merchant re-submissions, and known disposable payment channels.',
      icon: Fingerprint,
      color: 'from-rose-500/20 to-red-500/20',
      textColor: 'text-rose-500'
    },
    {
      title: 'Spending Insights',
      role: 'Statistical Variance Modeling',
      desc: 'Compares transaction amounts against your historical averages (+35%, -15%) and projects monthly budget impact.',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-teal-500/20',
      textColor: 'text-emerald-500'
    },
    {
      title: 'Recommendation',
      role: 'Actionable Advisory Synthesis',
      desc: 'Consolidates all signals into transparent, advisory decisions: Safe to Proceed, Review Recommended, or High Risk.',
      icon: Sparkles,
      color: 'from-purple-500/20 to-indigo-500/20',
      textColor: 'text-purple-500'
    },
    {
      title: 'Explainability',
      role: 'Plain-English Justifications',
      desc: 'Replaces cryptic machine learning scores with clear, expandable answers to "Why am I seeing this?" before you pay.',
      icon: MessageSquareQuote,
      color: 'from-teal-500/20 to-cyan-500/20',
      textColor: 'text-teal-500'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          PayPal AI Hackathon 2026 Prototype
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Pay Smarter. Pay Safer. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            With Agentic AI.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          PayPilot AI uses specialized intelligent agents to analyze payment context, detect potential risk signals, and explain what matters <span className="font-semibold text-slate-900 dark:text-white">before you pay</span>.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('new-payment')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Try PayPilot</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2"
          >
            <span>View How It Works</span>
          </button>
        </div>

        {/* User Agency Guarantee */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            User Remains in 100% Control
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Instant Sandbox Verification
          </span>
        </div>
      </section>

      {/* 6 Specialized Agents Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
            Multi-Agent Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Six Specialized Micro-Agents Working For You
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Instead of a single black-box LLM, PayPilot decomposes payment security into verifiable, structured expert agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentCards.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${agent.textColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {agent.title}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {agent.role}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    {agent.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Structured JSON</span>
                  <span className="text-emerald-500 font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Simple Architecture Flow */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/90 dark:to-slate-950 p-8 sm:p-12 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              The PayPilot Decision Journey
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transparent, explainable intelligence before a single penny moves
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-emerald-500">Step 1</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Payment Intent</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">User inputs amount, merchant, and notes</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-emerald-500">Step 2</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">6-Agent Pipeline</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Risk, fraud, spending & explainability consensus</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-emerald-500">Step 3</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">User Decision</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">User evaluates reasons and approves or cancels</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-emerald-500">Step 4</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">PayPal Checkout</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Secure order capture via PayPal Sandbox</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
