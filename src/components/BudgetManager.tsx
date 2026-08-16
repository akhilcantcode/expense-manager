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
      <div className="bg-[#161616] p-5 sm:p-6 rounded-xl border border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
            Allocation & Constraints
          </p>
          <h2 className="text-xl sm:text-2xl font-light text-[#E5E5E5] tracking-tight mt-1">
            Monthly Budget Targets
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Currency selector */}
          <div className="flex items-center space-x-2 bg-[#0A0A0A] px-3 py-1.5 rounded-lg border border-[#2A2A2A] text-xs font-semibold">
            <span className="text-[#9E9E9E]">Currency:</span>
            <select
              id="budget-currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent font-bold text-[#E5E5E5] outline-none cursor-pointer"
            >
              <option value="₹" className="bg-[#161616] text-[#E5E5E5]">₹ INR (₹)</option>
              <option value="$" className="bg-[#161616] text-[#E5E5E5]">$ USD ($)</option>
              <option value="€" className="bg-[#161616] text-[#E5E5E5]">€ EUR (€)</option>
              <option value="£" className="bg-[#161616] text-[#E5E5E5]">£ GBP (£)</option>
              <option value="¥" className="bg-[#161616] text-[#E5E5E5]">¥ JPY/CNY (¥)</option>
              <option value="A$" className="bg-[#161616] text-[#E5E5E5]">A$ AUD (A$)</option>
              <option value="C$" className="bg-[#161616] text-[#E5E5E5]">C$ CAD (C$)</option>
            </select>
          </div>

          <button
            id="budget-clear-btn"
            type="button"
            onClick={handleClearAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2A2A2A] border border-[#3A3A3A] text-[#CF6679] hover:bg-[#322022] hover:border-[#CF6679]/30 transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Limits</span>
          </button>

          <button
            id="budget-save-btn"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#BB86FC] text-black hover:bg-[#A370DB] transition-colors shadow-xs"
          >
            {hasSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Targets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Target & Allocation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9E9E9E] block">
            Overall Monthly Target
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9E9E9E] text-base font-semibold">
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
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] text-lg font-bold text-[#E5E5E5] focus:outline-none focus:border-[#BB86FC]"
            />
          </div>

          <div className="p-4 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A] space-y-2.5 text-xs">
            <div className="flex justify-between text-[#9E9E9E]">
              <span>Category Sum:</span>
              <span className="font-semibold text-[#E5E5E5] font-mono">
                {formatCurrency(totalAllocated, selectedCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-[#9E9E9E]">
              <span>Actual Spent:</span>
              <span className="font-semibold text-[#CF6679] font-mono">
                {formatCurrency(analytics.totalExpense, selectedCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-[#9E9E9E]">
              <span>Remaining Capacity:</span>
              <span className="font-semibold text-[#03DAC6] font-mono">
                {totalLimit > 0
                  ? formatCurrency(Math.max(0, totalLimit - analytics.totalExpense), selectedCurrency)
                  : "— (No Limit)"
                }
              </span>
            </div>
          </div>
        </div>

        {/* Categories Progress & Sliders */}
        <div className="md:col-span-2 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs">
          <div className="mb-4">
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
              Granular Controls
            </p>
            <h3 className="font-light text-[#E5E5E5] text-base mt-0.5">
              Category Limits vs Actuals
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
                    className="p-3.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#202020] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-semibold text-[#E5E5E5]">
                          {cat.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isOver ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#2A1518] text-[#CF6679] border border-[#441C22]">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Over limit
                          </span>
                        ) : isNear ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#2A2315] text-[#FFB74D] border border-[#44381C]">
                            Near limit ({percentage.toFixed(0)}%)
                          </span>
                        ) : null}

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-[#9E9E9E] font-mono">
                            {formatCurrency(spent, selectedCurrency)} spent
                            {limit > 0 ? ' /' : ' (No target)'}
                          </span>
                          {limit > 0 && (
                            <span className="text-[#E5E5E5] font-mono font-bold">
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
                              className="w-full text-right py-0.5 px-1.5 font-mono font-bold text-[#E5E5E5] border border-[#2A2A2A] rounded bg-[#0A0A0A] text-xs focus:outline-none focus:border-[#BB86FC]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {limit > 0 && (
                      <div className="w-full bg-[#2A2A2A] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-[#CF6679]' : isNear ? 'bg-[#FFB74D]' : 'bg-[#BB86FC]'
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
