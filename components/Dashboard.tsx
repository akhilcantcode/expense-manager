'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { ExpenseItem, FilterState, BudgetConfig } from '../src/types';
import { computeAnalytics, filterExpenses, exportToCSV } from '../src/utils/helpers';
import { Header } from '../src/components/Header';
import { SummaryCards } from '../src/components/SummaryCards';
import { ExpenseDistribution } from '../src/components/ExpenseDistribution';
import { ExpenseList } from '../src/components/ExpenseList';
import { AnalyticsView } from '../src/components/AnalyticsView';
import { ExpenseModal } from '../src/components/ExpenseModal';
import { DeleteConfirmModal } from '../src/components/DeleteConfirmModal';
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
  bulkImportExpenses,
} from '../lib/actions/expenses';
import {
  Plus,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  ArrowRight,
  CloudUpload,
} from 'lucide-react';

interface DashboardProps {
  initialExpenses: ExpenseItem[];
  initialBudget: BudgetConfig;
}

export function Dashboard({ initialExpenses, initialBudget }: DashboardProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [budget, setBudget] = useState<BudgetConfig>(initialBudget);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ExpenseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    paymentMethod: 'all',
    dateRange: 'this_month',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Re-sync from server on user state change or refresh
  const handleRefresh = async () => {
    if (!isSignedIn) return;
    setIsRefreshing(true);
    try {
      const freshExpenses = await getExpenses();
      setExpenses(freshExpenses);
      showNotice(`Synced ${freshExpenses.length} transactions from Neon DB.`);
    } catch (err: any) {
      console.error('Refresh error:', err);
      showNotice(`Failed to refresh: ${err.message || 'Network error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Save Expense (Add or Edit)
  const handleSaveExpense = async (
    itemData: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>
  ) => {
    if (editingItem) {
      // Update
      const optimisticUpdated: ExpenseItem = {
        ...editingItem,
        ...itemData,
        updatedAt: new Date().toISOString(),
        syncedToSheet: true,
      };

      setExpenses((prev) =>
        prev.map((it) => (it.id === editingItem.id ? optimisticUpdated : it))
      );
      showNotice(`Updated "${optimisticUpdated.title}"`);

      if (isSignedIn) {
        try {
          await updateExpense(editingItem.id, itemData);
        } catch (err) {
          console.error('Failed to update in database:', err);
          showNotice('Could not persist update to Neon DB.');
        }
      }
    } else {
      // Create
      const tempId = 'temp-' + Date.now();
      const optimisticNew: ExpenseItem = {
        ...itemData,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedToSheet: true,
      };

      setExpenses((prev) => [optimisticNew, ...prev]);
      showNotice(`Added "${optimisticNew.title}"`);

      if (isSignedIn) {
        try {
          const persisted = await createExpense(itemData);
          setExpenses((prev) =>
            prev.map((it) => (it.id === tempId ? persisted : it))
          );
        } catch (err) {
          console.error('Failed to create in database:', err);
          showNotice('Saved locally, but failed to persist to Neon DB.');
        }
      }
    }

    setEditingItem(null);
  };

  // Handle Delete Expense
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);

    const targetId = deleteCandidate.id;
    setExpenses((prev) => prev.filter((it) => it.id !== targetId));
    showNotice(`Deleted "${deleteCandidate.title}"`);

    if (isSignedIn) {
      try {
        await deleteExpense(targetId);
      } catch (err) {
        console.error('Failed to delete in database:', err);
        showNotice('Failed to delete from Neon DB.');
      }
    }

    setIsDeleting(false);
    setDeleteCandidate(null);
  };

  // Analytics computation
  const analytics = useMemo(() => computeAnalytics(expenses), [expenses]);
  const filteredExpenses = useMemo(() => filterExpenses(expenses, filter), [expenses, filter]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#c6f24e] selection:text-black">
      {/* Header */}
      <Header
        onOpenAddModal={() => {
          setEditingItem(null);
          setIsExpenseModalOpen(true);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Notice Toast */}
      {notice && (
        <div data-ui className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-neutral-900 border border-neutral-700 text-white px-4 py-3 rounded-xl shadow-2xl text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#c6f24e] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Unauthenticated Guest Banner */}
        {/* {!isSignedIn && isLoaded && (
          <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[#c6f24e]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Save your data to Neon Postgres</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                  Sign in with Clerk so your transactions persist permanently across all devices and page refreshes.
                </p>
              </div>
            </div>
            <SignInButton mode="modal">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#c6f24e] text-black hover:bg-[#d8ff5e] transition-colors shrink-0 cursor-pointer">
                <span>Sign In with Clerk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </SignInButton>
          </div>
        )} */}

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Summary Cards */}
            <SummaryCards analytics={analytics} budget={budget} />

            {/* Quick Actions & Recent Transactions Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent Activity */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white tracking-tight">Recent Transactions</h2>
                    <p className="text-xs text-neutral-400">Latest recorded inflows and outflows</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-[#c6f24e] hover:underline flex items-center space-x-1"
                  >
                    <span>View all ({expenses.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ExpenseList
                  expenses={expenses.slice(0, 8)}
                  filter={filter}
                  onFilterChange={setFilter}
                  onEdit={(item) => {
                    setEditingItem(item);
                    setIsExpenseModalOpen(true);
                  }}
                  onDelete={(item) => setDeleteCandidate(item)}
                  onAddNew={() => {
                    setEditingItem(null);
                    setIsExpenseModalOpen(true);
                  }}
                  onExport={() => exportToCSV(expenses)}
                  budget={budget}
                />
              </div>

              {/* Right Column: Expense Distribution */}
              <div className="space-y-6">
                <ExpenseDistribution
                  analytics={analytics}
                  currency={budget.currency}
                  onViewAnalytics={() => setActiveTab('analytics')}
                  onAddNew={() => {
                    setEditingItem(null);
                    setIsExpenseModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Transactions</h1>
                <p className="text-xs text-neutral-400">
                  Search, filter, and manage your complete history ({filteredExpenses.length} matches)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportToCSV(expenses)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111111] text-neutral-300 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsExpenseModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors"
                >
                  + Add Record
                </button>
              </div>
            </div>

            <ExpenseList
              expenses={filteredExpenses}
              filter={filter}
              onFilterChange={setFilter}
              onEdit={(item) => {
                setEditingItem(item);
                setIsExpenseModalOpen(true);
              }}
              onDelete={(item) => setDeleteCandidate(item)}
              onAddNew={() => {
                setEditingItem(null);
                setIsExpenseModalOpen(true);
              }}
              onExport={() => exportToCSV(expenses)}
              budget={budget}
            />
          </div>
        )}

        {/* Tab 3: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Spending & Income Analytics</h1>
              <p className="text-xs text-neutral-400">Deep dive into category distributions, monthly trends, and payment habits</p>
            </div>
            <AnalyticsView
              analytics={analytics}
              expenses={expenses}
              budget={budget}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveExpense}
        initialItem={editingItem}
        currency={budget.currency}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteCandidate}
        item={deleteCandidate}
        isDeleting={isDeleting}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        currency={budget.currency}
      />
    </div>
  );
}
