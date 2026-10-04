import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  ShieldAlert, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import TransactionCard from '../components/TransactionCard';
import RiskExplanationModal from '../components/RiskExplanationModal';

export default function DashboardPage({ setActiveTab }) {
  const [insights, setInsights] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insightsData, txData] = await Promise.all([
        api.getInsights(),
        api.getTransactions({ sort_by: 'date' })
      ]);
      setInsights(insightsData);
      setRecentTransactions((txData.transactions || []).slice(0, 7));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectTransaction = async (tx) => {
    setSelectedTx(tx);
    try {
      const details = await api.getTransactionDetails(tx.id);
      setTxDetails(details);
    } catch (e) {
      setTxDetails(tx);
    }
  };

  const statCards = [
    {
      title: 'Total Transactions',
      value: insights ? insights.total_transactions : '—',
      icon: CreditCard,
      change: 'Active in system',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Total Amount',
      value: insights ? `$${insights.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
      icon: DollarSign,
      change: 'Captured volume',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Average Transaction',
      value: insights ? `$${insights.avg_transaction_amount.toFixed(2)}` : '—',
      icon: TrendingUp,
      change: 'Personal baseline',
      color: 'text-teal-500',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'AI Risk Alerts',
      value: insights ? insights.high_risk_count : '—',
      icon: ShieldAlert,
      change: `${insights?.medium_risk_count || 0} reviews recommended`,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Security & Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-agent oversight of your payments and merchant interactions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('new-payment')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Payment
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {card.value}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {card.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Key Insights Bar */}
      {insights?.key_insights && (
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                PayPilot Agent Observation
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                {insights.key_insights[0] || "All recent payment flows match verified consumer benchmarks."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('insights')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 whitespace-nowrap self-end md:self-center"
          >
            Explore Full Analytics
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical activity audited by PayPilot multi-agent engine
            </p>
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All Transactions ({insights?.total_transactions || 0})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onSelect={handleSelectTransaction}
            />
          ))}
          {recentTransactions.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400 text-sm">
              No transactions found. Click "New Payment" to run your first agentic analysis.
            </div>
          )}
        </div>
      </div>

      {/* Detailed Modal */}
      <RiskExplanationModal
        isOpen={Boolean(selectedTx)}
        onClose={() => { setSelectedTx(null); setTxDetails(null); }}
        transactionData={txDetails}
      />
    </div>
  );
}
