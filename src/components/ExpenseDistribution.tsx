'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowRight, Plus, PieChart as PieIcon } from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { formatCurrency, getCategoryInfo } from '../utils/helpers';

interface ExpenseDistributionProps {
  analytics: AnalyticsSummary;
  currency?: string;
  onViewAnalytics?: () => void;
  onAddNew?: () => void;
}

export const ExpenseDistribution: React.FC<ExpenseDistributionProps> = ({
  analytics,
  currency = '₹',
  onViewAnalytics,
  onAddNew,
}) => {
  const categoryData = useMemo(() => {
    return Object.entries(analytics.categoryTotals)
      .filter(([_, amount]) => Number(amount) > 0)
      .map(([category, amount]) => {
        const numAmount = Number(amount);
        const catInfo = getCategoryInfo(category);
        const percentage =
          analytics.totalExpense > 0 ? (numAmount / analytics.totalExpense) * 100 : 0;
        return {
          name: category,
          value: numAmount,
          percentage: Number(percentage.toFixed(1)),
          color: catInfo.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [analytics.categoryTotals, analytics.totalExpense]);

  const hasData = categoryData.length > 0 && analytics.totalExpense > 0;

  return (
    <div
      data-ui
      className="bg-[#111111] border border-neutral-800 rounded-xl p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Expense Distribution
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Spending categorized by outflow type
          </p>
        </div>
        {onViewAnalytics && (
          <button
            onClick={onViewAnalytics}
            className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {!hasData ? (
        <div className="py-6 px-4 flex flex-col items-center text-center space-y-4">
          {/* Subtle Ring Zero State */}
          <div className="w-28 h-28 rounded-full border border-dashed border-neutral-800 bg-neutral-900/40 flex flex-col items-center justify-center space-y-0.5">
            <PieIcon className="w-5 h-5 text-neutral-600 mb-1" />
            <span className="text-sm font-semibold text-neutral-400 tabular-nums">
              {formatCurrency(0, currency)}
            </span>
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
              No outlays
            </span>
          </div>

          <div className="max-w-xs space-y-1">
            <p className="text-sm font-medium text-neutral-300">
              No category data recorded
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Log an outflow to see your category breakdown, proportions, and spending distribution.
            </p>
          </div>

          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-neutral-200 border border-neutral-800 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log an expense</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Donut Chart */}
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cat-cell-${index}`}
                      fill={entry.color}
                      stroke="#111111"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [
                    formatCurrency(Number(val), currency),
                    'Amount',
                  ]}
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                Total spent
              </span>
              <span className="text-base font-semibold text-white tabular-nums">
                {formatCurrency(analytics.totalExpense, currency)}
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
            {categoryData.slice(0, 5).map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-neutral-300 font-medium truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span className="text-neutral-400 tabular-nums">
                      {formatCurrency(cat.value, currency)}
                    </span>
                    <span className="text-neutral-400 tabular-nums w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="w-full bg-neutral-800/60 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {categoryData.length > 5 && (
              <div className="pt-1 text-center">
                <span className="text-xs text-neutral-400">
                  +{categoryData.length - 5} more categories
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
