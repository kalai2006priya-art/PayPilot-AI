import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  CreditCard,
  ShoppingBag,
  Coffee,
  Plane,
  FileSpreadsheet,
  GraduationCap,
  Tv,
  Wrench,
  HelpCircle
} from 'lucide-react';

const CATEGORY_ICONS = {
  Food: Coffee,
  Shopping: ShoppingBag,
  Travel: Plane,
  Bills: FileSpreadsheet,
  Education: GraduationCap,
  Entertainment: Tv,
  Services: Wrench,
  Other: CreditCard
};

export default function TransactionCard({ transaction, onSelect }) {
  if (!transaction) return null;

  const CategoryIcon = CATEGORY_ICONS[transaction.category] || CreditCard;
  const isHighRisk = transaction.risk_level === 'HIGH';
  const isMedRisk = transaction.risk_level === 'MEDIUM';

  const riskBadgeStyles = isHighRisk
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    : isMedRisk
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

  const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      onClick={() => onSelect && onSelect(transaction)}
      className="group p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
          <CategoryIcon className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {transaction.merchant}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {transaction.id}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{transaction.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4">
        {/* Risk Badge */}
        <div className="flex flex-col items-start sm:items-end">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${riskBadgeStyles}`}>
            {transaction.risk_level} RISK ({transaction.risk_score})
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {transaction.payment_status}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {transaction.currency === 'USD' ? '$' : transaction.currency + ' '}
              {transaction.amount.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-500 font-semibold truncate max-w-[120px]">
              {transaction.ai_recommendation}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
