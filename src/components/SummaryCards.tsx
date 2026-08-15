import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { AnalyticsSummary, BudgetConfig } from '../types';
import { formatCurrency } from '../utils/helpers';

interface SummaryCardsProps {
  analytics: AnalyticsSummary;
  budget: BudgetConfig;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analytics, budget }) => {
  const { totalIncome, totalExpense, netSavings, savingsRate, transactionCount } = analytics;
  const budgetUtilization = budget.monthlyTotalLimit > 0
    ? (totalExpense / budget.monthlyTotalLimit) * 100
    : 0;
  const budgetRemaining = Math.max(0, budget.monthlyTotalLimit - totalExpense);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Income */}
      <div
        id="card-total-income"
        className="bg-[#161616] border border-[#2A2A2A] p-6 rounded-xl flex flex-col justify-between min-h-[155px] shadow-xs"
      >
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold mb-1">
              Total Income
            </p>
            <div className="w-7 h-7 rounded-md bg-[#1B2521] text-[#03DAC6] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-[#E5E5E5] mt-1">
            {formatCurrency(totalIncome, budget.currency)}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[#03DAC6] text-xs font-semibold mt-3">
          <span className="w-2 h-2 rounded-full bg-[#03DAC6]"></span>
          <span>Earnings & money in</span>
        </div>
      </div>

      {/* Total Expenses */}
      <div
        id="card-total-expense"
        className="bg-[#161616] border border-[#2A2A2A] p-6 rounded-xl flex flex-col justify-between min-h-[155px] shadow-xs"
      >
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold mb-1">
              Total Expenses
            </p>
            <div className="w-7 h-7 rounded-md bg-[#251D1B] text-[#CF6679] flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-[#E5E5E5] mt-1">
            {formatCurrency(totalExpense, budget.currency)}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[#CF6679] text-xs font-semibold mt-3">
          <span className="w-2 h-2 rounded-full bg-[#CF6679]"></span>
          <span>{transactionCount} transactions tracked</span>
        </div>
      </div>

      {/* Net Balance / Savings */}
      <div
        id="card-net-savings"
        className="bg-[#161616] border border-[#2A2A2A] p-6 rounded-xl flex flex-col justify-between min-h-[155px] shadow-xs"
      >
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold mb-1">
              Net Balance
            </p>
            <div className="w-7 h-7 rounded-md bg-[#241830] text-[#BB86FC] flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-light mt-1 ${
              netSavings >= 0 ? 'text-[#E5E5E5]' : 'text-[#CF6679]'
            }`}
          >
            {formatCurrency(netSavings, budget.currency)}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[#BB86FC] text-xs font-semibold mt-3">
          <span className="w-2 h-2 rounded-full bg-[#BB86FC]"></span>
          <span>Savings Rate: {savingsRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Monthly Budget Remaining */}
      <div
        id="card-monthly-budget"
        className="bg-[#161616] border border-[#2A2A2A] p-6 rounded-xl flex flex-col justify-between min-h-[155px] shadow-xs"
      >
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold mb-1">
              Budget Remaining
            </p>
            <span className="text-xs font-mono font-bold text-[#BB86FC]">
              {budgetUtilization.toFixed(0)}% used
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-[#E5E5E5] mt-1">
            {formatCurrency(budgetRemaining, budget.currency)}
          </h2>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="w-full bg-[#2A2A2A] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetUtilization > 100
                  ? 'bg-[#CF6679]'
                  : budgetUtilization > 80
                  ? 'bg-[#FFB74D]'
                  : 'bg-[#BB86FC]'
              }`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#9E9E9E] truncate">
            Left from {formatCurrency(budget.monthlyTotalLimit, budget.currency)} monthly budget
          </p>
        </div>
      </div>
    </div>
  );
};
