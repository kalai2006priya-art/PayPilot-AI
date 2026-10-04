import React from 'react';
import Logo from './Logo';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Logo size="sm" />
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Built for the <span className="font-semibold text-slate-700 dark:text-slate-200">PayPal AI Hackathon</span>. Multi-Agent Payment Intelligence.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <button onClick={() => setActiveTab('how-it-works')} className="hover:text-emerald-500 transition-colors">
              How It Works
            </button>
            <button onClick={() => setActiveTab('transactions')} className="hover:text-emerald-500 transition-colors">
              Audit Log
            </button>
            <button onClick={() => setActiveTab('settings')} className="hover:text-emerald-500 transition-colors">
              API Status
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          PayPilot AI is an informational decision assistant. It provides predictive risk signals and does not make binding financial transactions without explicit user authorization.
        </div>
      </div>
    </footer>
  );
}
