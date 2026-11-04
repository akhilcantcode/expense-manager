import React from 'react';
import { AnalyticsSummary, BudgetConfig } from '../types';
import { formatCurrency } from '../utils/helpers';

interface SummaryCardsProps {
  analytics: AnalyticsSummary;
  budget?: BudgetConfig;
  currency?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analytics, budget, currency = '₹' }) => {
  const activeCurrency = currency || budget?.currency || '₹';
  const { totalIncome, totalExpense, netSavings, savingsRate, transactionCount } = analytics;

  return (
    <div
      data-ui
      className="bg-[#111111] border border-neutral-800 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800"
    >
      {/* 1. Total Income */}
      <div
        id="card-total-income"
        className="p-5 sm:p-6 flex flex-col justify-between space-y-3 bg-[#111111] hover:bg-[#141414] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-neutral-400">Total income</span>
          <span className="text-[11px] text-neutral-500 tracking-wide uppercase">$$$</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white tabular-nums">
            {formatCurrency(totalIncome, activeCurrency)}
          </div>
        </div>
        <div className="flex items-center text-xs text-neutral-400 pt-1">
          {totalIncome > 0 ? (
            <span className="text-neutral-300">deposits</span>
          ) : (
            <span className="text-neutral-500">haven't added any income yet.</span>
          )}
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div
        id="card-total-expense"
        className="p-5 sm:p-6 flex flex-col justify-between space-y-3 bg-[#111111] hover:bg-[#141414] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-neutral-400">Total expenses</span>
          <span className="text-[11px] text-neutral-500 tracking-wide uppercase">-$$$</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white tabular-nums">
            {formatCurrency(totalExpense, activeCurrency)}
          </div>
        </div>
        <div className="flex items-center text-xs text-neutral-400 pt-1">
          {transactionCount > 0 ? (
            <span className="text-neutral-300">
              {transactionCount} transactions tracked
            </span>
          ) : (
            <span className="text-neutral-500">no expenses added so far.</span>
          )}
        </div>
      </div>

      {/* 3. Net Balance (The Result / Lead Figure) */}
      <div
        id="card-net-savings"
        className="p-5 sm:p-6 flex flex-col justify-between space-y-3 bg-[#111111] hover:bg-[#141414] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-neutral-400">Net balance</span>
          <span className="text-[11px] text-neutral-500 tracking-wide uppercase">$$$</span>
        </div>
        <div>
          <div
            className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums ${netSavings < 0 ? 'text-[#e5484d]' : 'text-white'
              }`}
          >
            {formatCurrency(netSavings, activeCurrency)}
          </div>
        </div>
        <div className="flex items-center text-xs pt-1">
          {savingsRate > 0 ? (
            <span className="text-[#c6f24e] font-medium">
              +{savingsRate.toFixed(1)}% savings
            </span>
          ) : totalIncome === 0 && totalExpense === 0 ? (
            <span className="text-neutral-500">no kharche recorded.</span>
          ) : (
            <span className={netSavings >= 0 ? 'text-neutral-400' : 'text-[#e5484d]'}>
              {netSavings >= 0 ? 'Balanced' : 'Negative cash flow'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
