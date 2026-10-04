import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Fingerprint, 
  TrendingUp, 
  Sparkles, 
  MessageSquareQuote,
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  Clock
} from 'lucide-react';

const AGENT_CONFIGS = [
  {
    id: 'agent-understanding',
    title: 'Transaction Understanding Agent',
    icon: FileText,
    desc: 'Extracts merchant intent, category match & urgency triggers'
  },
  {
    id: 'agent-risk',
    title: 'Risk Analysis Agent',
    icon: ShieldAlert,
    desc: 'Computes multi-factor risk score (0-100) & timing metrics'
  },
  {
    id: 'agent-fraud',
    title: 'Fraud Signal Agent',
    icon: Fingerprint,
    desc: 'Inspects duplicate payment frequency & velocity spikes'
  },
  {
    id: 'agent-spending',
    title: 'Spending Pattern Agent',
    icon: TrendingUp,
    desc: 'Benchmarks against historical category trends & deviation'
  },
  {
    id: 'agent-recommendation',
    title: 'Recommendation Agent',
    icon: Sparkles,
    desc: 'Synthesizes advisory actions (Safe, Review, High Risk)'
  },
  {
    id: 'agent-explainability',
    title: 'Explainability Agent',
    icon: MessageSquareQuote,
    desc: 'Translates technical signals into clear human insights'
  }
];

export default function AgentPipelineVisualizer({ isAnalyzing, pipelineData, onComplete }) {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      setCompletedSteps(0);
      const interval = setInterval(() => {
        setCompletedSteps((prev) => {
          if (prev < AGENT_CONFIGS.length) {
            return prev + 1;
          } else {
            clearInterval(interval);
            if (onComplete) onComplete();
            return prev;
          }
        });
      }, 420); // 420ms pacing per agent for realistic agentic visualization

      return () => clearInterval(interval);
    } else if (pipelineData) {
      setCompletedSteps(AGENT_CONFIGS.length);
    }
  }, [isAnalyzing, pipelineData]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            PayPilot Multi-Agent Payment Intelligence Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sequential consensus pipeline executing across 6 specialized AI micro-agents
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {completedSteps === AGENT_CONFIGS.length ? (
            <span className="text-emerald-500 font-bold">Consensus Reached</span>
          ) : (
            <span>Processing Step {Math.min(completedSteps + 1, AGENT_CONFIGS.length)}/6</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {AGENT_CONFIGS.map((agent, index) => {
          const isDone = completedSteps > index;
          const isCurrent = completedSteps === index && isAnalyzing;
          const isPending = completedSteps < index;
          const Icon = agent.icon;

          // Pull matching step result if available
          const stepResult = pipelineData?.steps?.find((s) => s.agent_id === agent.id);
          const hasWarning = stepResult?.status === 'WARNING';
          const hasAlert = stepResult?.status === 'ALERT';

          return (
            <div
              key={agent.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                isCurrent
                  ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20'
                  : isDone
                  ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40'
                  : 'border-slate-100 dark:border-slate-800/30 opacity-40 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isDone
                      ? hasAlert
                        ? 'bg-rose-500/10 text-rose-500'
                        : hasWarning
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                      : isCurrent
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {agent.title}
                    </h4>
                    {isDone && stepResult?.execution_time_ms && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {stepResult.execution_time_ms}ms
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {agent.desc}
                  </p>
                </div>
              </div>

              <div>
                {isCurrent && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating...</span>
                  </div>
                )}
                {isDone && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {hasAlert ? (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Flagged
                      </span>
                    ) : hasWarning ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Attention
                      </span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    )}
                  </div>
                )}
                {isPending && (
                  <span className="text-xs text-slate-400">Queued</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
