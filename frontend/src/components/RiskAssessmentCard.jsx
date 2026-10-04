import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info,
  CreditCard,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function RiskAssessmentCard({
  assessmentData,
  onProceed,
  onCancel,
  onOpenDetails
}) {
  const [expanded, setExpanded] = useState(false);

  if (!assessmentData) return null;

  const {
    risk_score,
    risk_level,
    recommendation,
    confidence,
    reasons = [],
    explainability,
    understanding,
    spending_insights
  } = assessmentData;

  const isLowRisk = risk_level === 'LOW';
  const isMedRisk = risk_level === 'MEDIUM';
  const isHighRisk = risk_level === 'HIGH';

  // Badge and style mapping
  const themeStyles = isHighRisk
    ? {
        border: 'border-rose-500/40',
        bg: 'bg-rose-500/5 dark:bg-rose-950/20',
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        scoreColor: 'text-rose-600 dark:text-rose-400',
        buttonBg: 'bg-rose-600 hover:bg-rose-700',
        icon: ShieldAlert
      }
    : isMedRisk
    ? {
        border: 'border-amber-500/40',
        bg: 'bg-amber-500/5 dark:bg-amber-950/20',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        scoreColor: 'text-amber-600 dark:text-amber-400',
        buttonBg: 'bg-amber-600 hover:bg-amber-700',
        icon: AlertTriangle
      }
    : {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-500/5 dark:bg-emerald-950/20',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        scoreColor: 'text-emerald-600 dark:text-emerald-400',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
        icon: ShieldCheck
      };

  const StatusIcon = themeStyles.icon;

  return (
    <div className={`w-full rounded-2xl border ${themeStyles.border} ${themeStyles.bg} p-6 shadow-md transition-all duration-300`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${themeStyles.badgeBg}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AI Payment Assessment
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${themeStyles.badgeBg}`}>
                {risk_level} RISK
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {recommendation}
            </h2>
          </div>
        </div>

        {/* Score Ring / Pill */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">Calculated Score</div>
            <div className={`text-2xl font-black ${themeStyles.scoreColor}`}>
              {risk_score}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
            <div
              className={`absolute inset-0 rounded-full border-4 ${
                isHighRisk ? 'border-rose-500' : isMedRisk ? 'border-amber-500' : 'border-emerald-500'
              }`}
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${risk_score}%, 0 ${risk_score}%)`
              }}
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Human Summary */}
      {explainability?.human_summary && (
        <div className="py-4">
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            {explainability.human_summary}
          </p>
        </div>
      )}

      {/* WHY Checklist Section */}
      <div className="py-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Why did PayPilot generate this assessment?
        </h4>
        <div className="space-y-2">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable "Why am I seeing this?" Section */}
      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Detailed Factor Breakdown ({explainability?.breakdown_factors?.length || 5} criteria)
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && explainability?.breakdown_factors && (
          <div className="mt-3 space-y-2.5 pt-2">
            {explainability.breakdown_factors.map((factor, idx) => {
              const badgeStyles =
                factor.badge === 'WARNING'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : factor.badge === 'CAUTION'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {factor.title}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {factor.detail}
                    </p>
                  </div>
                  <span className={`self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${badgeStyles}`}>
                    {factor.badge}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advisory Notice */}
      <div className="mt-4 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          AI-generated assessment — review the details before proceeding. PayPilot AI provides predictive risk signals to assist your decision. The user remains in full control.
        </span>
      </div>

      {/* User Decision Action Bar */}
      <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 self-start sm:self-center">
          How would you like to continue?
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            Cancel Payment
          </button>

          <button
            onClick={onProceed}
            type="button"
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
              isHighRisk ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Proceed to Pay with PayPal
          </button>
        </div>
      </div>
    </div>
  );
}
