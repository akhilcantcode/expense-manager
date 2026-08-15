import React from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Plus,
  CheckCircle2,
  Cloud,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';
import { ExpenseItem, FilterState, BudgetConfig } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency, formatDate, getCategoryInfo } from '../utils/helpers';

interface ExpenseListProps {
  expenses: ExpenseItem[];
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (item: ExpenseItem) => void;
  onAddNew: () => void;
  onExport: () => void;
  budget: BudgetConfig;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  filter,
  onFilterChange,
  onEdit,
  onDelete,
  onAddNew,
  onExport,
  budget,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#161616] p-4 sm:p-5 rounded-xl border border-[#2A2A2A] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9E9E9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="expenses-search-input"
              type="text"
              placeholder="Search expenses by title, merchant, notes or amount..."
              value={filter.search}
              onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-xs sm:text-sm text-[#E5E5E5] placeholder-[#666666] focus:outline-none focus:border-[#BB86FC] transition-all"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              id="expenses-export-csv-btn"
              onClick={onExport}
              title="Export filtered records to CSV"
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-[#E5E5E5] border border-[#333333] rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              id="expenses-add-new-btn"
              onClick={onAddNew}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#BB86FC] hover:bg-[#A370DB] text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#222222] text-xs">
          {/* Type Toggle */}
          <div className="inline-flex rounded-lg bg-[#0A0A0A] p-0.5 border border-[#2A2A2A]">
            <button
              onClick={() => onFilterChange({ ...filter, type: 'all' })}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold uppercase text-[11px] tracking-wider ${
                filter.type === 'all'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange({ ...filter, type: 'expense' })}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold uppercase text-[11px] tracking-wider ${
                filter.type === 'expense'
                  ? 'bg-[#2A2A2A] text-[#CF6679] shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#CF6679]'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => onFilterChange({ ...filter, type: 'income' })}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold uppercase text-[11px] tracking-wider ${
                filter.type === 'income'
                  ? 'bg-[#2A2A2A] text-[#03DAC6] shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#03DAC6]'
              }`}
            >
              Income
            </button>
          </div>

          {/* Date Range Selector */}
          <select
            id="filter-date-range-select"
            value={filter.dateRange}
            onChange={(e) => onFilterChange({ ...filter, dateRange: e.target.value as any })}
            className="px-2.5 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] text-[#E5E5E5] font-medium focus:outline-none focus:border-[#BB86FC] cursor-pointer"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Dates</option>
          </select>

          {/* Category Dropdown */}
          <select
            id="filter-category-select"
            value={filter.category}
            onChange={(e) => onFilterChange({ ...filter, category: e.target.value })}
            className="px-2.5 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] text-[#E5E5E5] font-medium focus:outline-none focus:border-[#BB86FC] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.label} value={cat.label}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            id="filter-payment-select"
            value={filter.paymentMethod}
            onChange={(e) => onFilterChange({ ...filter, paymentMethod: e.target.value })}
            className="px-2.5 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] text-[#E5E5E5] font-medium focus:outline-none focus:border-[#BB86FC] cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center space-x-1.5">
            <span className="text-[#9E9E9E] text-xs">Sort:</span>
            <select
              id="filter-sort-by-select"
              value={filter.sortBy}
              onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value as any })}
              className="px-2 py-1 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] text-[#E5E5E5] font-medium focus:outline-none focus:border-[#BB86FC] cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
            </select>
            <button
              id="filter-sort-order-toggle"
              onClick={() =>
                onFilterChange({
                  ...filter,
                  sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              title={`Sort order: ${filter.sortOrder}`}
              className="p-1.5 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#202020]"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="bg-[#161616] rounded-xl border border-[#2A2A2A] shadow-xs overflow-hidden">
        {expenses.length > 0 ? (
          <div className="divide-y divide-[#222222]">
            {expenses.map((item) => {
              const cat = getCategoryInfo(item.category);
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item.id}
                  id={`transaction-row-${item.id}`}
                  className="p-4 sm:px-6 hover:bg-[#1C1C1C] transition-colors flex items-center justify-between gap-3 group"
                >
                  {/* Left: Category Icon & Title */}
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[#2A2A2A]"
                      style={{ backgroundColor: cat.bgLight, color: cat.color }}
                    >
                      <span className="font-bold text-xs">
                        {item.category.slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-[#E5E5E5] truncate">
                          {item.title}
                        </h4>
                        {item.syncedToSheet ? (
                          <span
                            title="Synced with Google Sheet"
                            className="inline-flex text-[#03DAC6]"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#9E9E9E] mt-0.5">
                        <span
                          className="font-medium"
                          style={{ color: cat.color }}
                        >
                          {item.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(item.date)}</span>
                        <span>•</span>
                        <span className="bg-[#242424] text-[#CCCCCC] px-1.5 py-0.5 rounded text-[11px]">
                          {item.paymentMethod}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-[#777777] mt-0.5 truncate max-w-sm">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-sm sm:text-base font-bold font-mono ${
                          isIncome ? 'text-[#03DAC6]' : 'text-[#E5E5E5]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(item.amount, budget.currency)}
                      </span>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`edit-expense-${item.id}`}
                        onClick={() => onEdit(item)}
                        title="Edit transaction"
                        className="p-1.5 text-[#9E9E9E] hover:text-[#BB86FC] hover:bg-[#2A2A2A] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-expense-${item.id}`}
                        onClick={() => onDelete(item)}
                        title="Delete transaction"
                        className="p-1.5 text-[#9E9E9E] hover:text-[#CF6679] hover:bg-[#2A1818] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#2A2A2A] text-[#9E9E9E] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#E5E5E5]">No transactions found</h3>
            <p className="text-xs text-[#9E9E9E] max-w-xs mx-auto mt-1">
              No records match your active filters or date range. Try clearing filters or add a new
              transaction.
            </p>
            <button
              onClick={onAddNew}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#BB86FC] text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#A370DB] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
