'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  Save,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingDown,
  Trash2,
} from 'lucide-react';
import { BudgetConfig, ExpenseCategory, AnalyticsSummary } from '../types';
import { CATEGORIES, formatCurrency, getCategoryInfo } from '../utils/helpers';

interface BudgetManagerProps {
  budget: BudgetConfig;
  onUpdateBudget: (newBudget: BudgetConfig) => void;
  analytics: AnalyticsSummary;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budget,
  onUpdateBudget,
  analytics,
}) => {
  const [totalLimit, setTotalLimit] = useState<number>(budget.monthlyTotalLimit);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({
    ...budget.categoryBudgets,
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>(budget.currency || '$');
  const [hasSaved, setHasSaved] = useState(false);

  const handleCategoryChange = (category: string, value: number) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [category]: Math.max(0, value),
    }));
  };

  const handleSave = () => {
    onUpdateBudget({
      monthlyTotalLimit: totalLimit,
      categoryBudgets: categoryLimits,
      currency: selectedCurrency,
    });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  const handleClearAll = () => {
    setTotalLimit(0);
    const clearedCats: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      clearedCats[cat.label] = 0;
    });
    setCategoryLimits(clearedCats);
  };

  const totalAllocated: number = (Object.values(categoryLimits) as number[]).reduce(
    (a, b) => Number(a) + Number(b),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111111] p-5 sm:p-6 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Monthly Budget Targets
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure overall and category spending limits
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Currency selector */}
          <div className="flex items-center space-x-2 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium">
            <span className="text-neutral-400">Currency:</span>
            <select
              id="budget-currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent font-medium text-white outline-none cursor-pointer"
            >
              <option value="₹" className="bg-[#111111] text-white">₹ INR (₹)</option>
              <option value="$" className="bg-[#111111] text-white">$ USD ($)</option>
              <option value="€" className="bg-[#111111] text-white">€ EUR (€)</option>
              <option value="£" className="bg-[#111111] text-white">£ GBP (£)</option>
              <option value="¥" className="bg-[#111111] text-white">¥ JPY/CNY (¥)</option>
              <option value="A$" className="bg-[#111111] text-white">A$ AUD (A$)</option>
              <option value="C$" className="bg-[#111111] text-white">C$ CAD (C$)</option>
            </select>
          </div>

          <button
            id="budget-clear-btn"
            type="button"
            onClick={handleClearAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-[#e5484d] hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear limits</span>
          </button>

          <button
            id="budget-save-btn"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {hasSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save targets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Target & Allocation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 bg-[#111111] p-6 rounded-xl border border-neutral-800 space-y-4">
          <p className="text-xs font-medium text-neutral-400 block">
            Overall monthly target
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 text-base font-medium">
              {selectedCurrency}
            </span>
            <input
              id="budget-total-limit-input"
              type="number"
              min="0"
              step="50"
              value={totalLimit === 0 ? '' : totalLimit}
              placeholder="No limit"
              onChange={(e) => setTotalLimit(Number(e.target.value))}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-lg font-semibold text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Category sum:</span>
              <span className="font-semibold text-white">
                {formatCurrency(totalAllocated, selectedCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Actual spent:</span>
              <span className="font-semibold text-[#e5484d]">
                {formatCurrency(analytics.totalExpense, selectedCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Remaining capacity:</span>
              <span className="font-semibold text-[#c6f24e]">
                {totalLimit > 0
                  ? formatCurrency(Math.max(0, totalLimit - analytics.totalExpense), selectedCurrency)
                  : "— (No limit)"
                }
              </span>
            </div>
          </div>
        </div>

        {/* Categories Progress & Sliders */}
        <div className="md:col-span-2 bg-[#111111] p-6 rounded-xl border border-neutral-800">
          <div className="mb-4">
            <h3 className="font-medium text-white text-base">
              Category limits vs actuals
            </h3>
          </div>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2">
            {CATEGORIES.filter((c) => c.label !== 'Salary & Income' && c.label !== 'Investments').map(
              (cat) => {
                const limit = categoryLimits[cat.label] || 0;
                const spent = analytics.categoryTotals[cat.label] || 0;
                const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                const isOver = limit > 0 && spent > limit;
                const isNear = limit > 0 && percentage >= 80 && !isOver;

                return (
                  <div
                    key={cat.label}
                    className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-medium text-white">
                          {cat.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isOver ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2c1a20] text-[#e5484d] border border-[#441C22]">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Over limit
                          </span>
                        ) : isNear ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2b2414] text-[#e5a93b] border border-[#44381C]">
                            Near limit ({percentage.toFixed(0)}%)
                          </span>
                        ) : null}

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-neutral-400">
                            {formatCurrency(spent, selectedCurrency)} spent
                            {limit > 0 ? ' /' : ' (No target)'}
                          </span>
                          {limit > 0 && (
                            <span className="text-white font-medium">
                              {formatCurrency(limit, selectedCurrency)}
                            </span>
                          )}
                          <div className="relative w-18 ml-1">
                            <input
                              type="number"
                              min="0"
                              step="25"
                              value={limit === 0 ? '' : limit}
                              placeholder="No target"
                              onChange={(e) =>
                                handleCategoryChange(cat.label, Number(e.target.value))
                              }
                              className="w-full text-right py-0.5 px-1.5 font-medium text-white border border-neutral-800 rounded bg-black text-xs focus:outline-none focus:border-neutral-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {limit > 0 && (
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-colors ${
                            isOver ? 'bg-[#e5484d]' : isNear ? 'bg-[#e5a93b]' : 'bg-white'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
