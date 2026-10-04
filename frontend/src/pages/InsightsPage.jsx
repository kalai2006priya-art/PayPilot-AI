import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  ShieldAlert, 
  DollarSign, 
  Sparkles, 
  AlertTriangle,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import TransactionCard from '../components/TransactionCard';
import RiskExplanationModal from '../components/RiskExplanationModal';

const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#64748b', // slate
  '#f43f5e'  // rose
];

export default function InsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getInsights();
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            AI Spending Intelligence & Risk Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Autonomous multi-agent synthesis of financial behavior and anomaly vectors
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start sm:self-center"
          title="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Key Insight Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Spending Baseline
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              ${insights ? insights.avg_transaction_amount.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Average transaction amount across routine consumer spending.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Review Recommended
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {insights ? `${insights.medium_risk_count} Transactions` : '0'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Required secondary review due to category variance or duplicate signals.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent border border-rose-500/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              High Risk Prevented
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {insights ? `${insights.high_risk_count} Flagged` : '0'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Spike anomalies or unverified recipient patterns safely declined.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Breakdown Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-500" />
                Spending by Category
              </h3>
              <p className="text-xs text-slate-400">Distribution across verified merchant categories</p>
            </div>
          </div>

          <div className="h-64">
            {insights?.category_spending && insights.category_spending.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insights.category_spending}
                    dataKey="total_amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {insights.category_spending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`$${parseFloat(val).toFixed(2)}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available
              </div>
            )}
          </div>

          {/* Category Legend Pills */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {insights?.category_spending?.map((cat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                <span className="font-semibold">{cat.category}</span>
                <span className="text-slate-400">(${cat.total_amount.toFixed(0)})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Monthly Spending Trends Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                Monthly Spending Volume
              </h3>
              <p className="text-xs text-slate-400">Completed volume over recent billing cycles</p>
            </div>
          </div>

          <div className="h-64">
            {insights?.monthly_spending && insights.monthly_spending.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.monthly_spending} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(val) => [`$${parseFloat(val).toFixed(2)}`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="total_amount" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI-Detected Unusual Transactions */}
      {insights?.unusual_transactions && insights.unusual_transactions.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              AI-Detected Unusual Transactions
            </h3>
            <p className="text-xs text-slate-400">
              Transactions flagged by the multi-agent engine for secondary review or abnormal deviation
            </p>
          </div>

          <div className="space-y-2.5">
            {insights.unusual_transactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onSelect={(t) => setSelectedTx(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      <RiskExplanationModal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        transactionData={selectedTx}
      />
    </div>
  );
}
