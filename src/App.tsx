import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedToken,
} from './services/firebaseAuth';
import {
  findOrCreateExpenseSpreadsheet,
  fetchExpensesFromSheet,
  appendExpenseToSheet,
  updateExpenseInSheet,
  deleteExpenseFromSheet,
  syncFullDatasetToSheet,
} from './services/googleSheets';
import {
  loadStoredExpenses,
  saveStoredExpenses,
  loadStoredBudget,
  saveStoredBudget,
  loadStoredSheetMeta,
  saveStoredSheetMeta,
} from './services/storage';
import { ExpenseItem, FilterState, BudgetConfig, SheetMetadata } from './types';
import { computeAnalytics, filterExpenses, exportToCSV } from './utils/helpers';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetManager } from './components/BudgetManager';
import { ExpenseModal } from './components/ExpenseModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sheetMeta, setSheetMeta] = useState<SheetMetadata | null>(loadStoredSheetMeta);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(loadStoredExpenses);
  const [budget, setBudget] = useState<BudgetConfig>(loadStoredBudget);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics' | 'budget'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ExpenseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);

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

  // Keep local storage updated
  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredBudget(budget);
  }, [budget]);

  useEffect(() => {
    saveStoredSheetMeta(sheetMeta);
  }, [sheetMeta]);

  // Firebase Auth listener initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setCachedToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const showNotice = (msg: string) => {
    setSyncNotice(msg);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // Google Sign-In action
  const handleSignIn = async () => {
    try {
      setIsSyncing(true);
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showNotice(`Welcome back, ${result.user.displayName || result.user.email}!`);

        // Discover or create Google Sheet
        try {
          const sheetInfo = await findOrCreateExpenseSpreadsheet(result.accessToken);
          const newMeta: SheetMetadata = {
            spreadsheetId: sheetInfo.spreadsheetId,
            spreadsheetUrl: sheetInfo.spreadsheetUrl,
            sheetName: 'Expenses',
            lastSyncedAt: new Date().toISOString(),
          };
          setSheetMeta(newMeta);

          if (sheetInfo.isNew) {
            // Upload current local items to newly created spreadsheet
            if (expenses.length > 0) {
              await syncFullDatasetToSheet(result.accessToken, sheetInfo.spreadsheetId, expenses);
            }
            showNotice('Created dedicated "Personal Expenses" Google Sheet in your Drive!');
          } else {
            // Load existing items from sheet
            const sheetExpenses = await fetchExpensesFromSheet(result.accessToken, sheetInfo.spreadsheetId);
            if (sheetExpenses.length > 0) {
              setExpenses(sheetExpenses);
              showNotice(`Loaded ${sheetExpenses.length} transactions from Google Sheets.`);
            } else if (expenses.length > 0) {
              await syncFullDatasetToSheet(result.accessToken, sheetInfo.spreadsheetId, expenses);
            }
          }
        } catch (sheetErr: any) {
          console.error('Sheet setup error:', sheetErr);
          showNotice(`Google Sheet connection notice: ${sheetErr.message}`);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showNotice(`Sign-in error: ${err.message || 'Failed to authenticate'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    showNotice('Signed out successfully.');
  };

  // Manual Synchronize action
  const handleManualSync = async () => {
    if (!token && user) {
      // Re-trigger sign in to acquire fresh token
      await handleSignIn();
      return;
    }
    if (!token || !sheetMeta) {
      showNotice('Please connect your Google account to sync.');
      return;
    }

    try {
      setIsSyncing(true);
      const sheetExpenses = await fetchExpensesFromSheet(token, sheetMeta.spreadsheetId);
      if (sheetExpenses.length > 0) {
        setExpenses(sheetExpenses);
        setSheetMeta((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null));
        showNotice(`Synchronized ${sheetExpenses.length} items with Google Sheets.`);
      } else {
        // If sheet is empty, push local data
        await syncFullDatasetToSheet(token, sheetMeta.spreadsheetId, expenses);
        setSheetMeta((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null));
        showNotice('Pushed local transactions to Google Sheets.');
      }
    } catch (e: any) {
      console.error('Manual sync failed:', e);
      showNotice(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Force direction sync (push or pull)
  const handleForceSync = async (direction: 'push' | 'pull') => {
    const currentToken = token || (await getAccessToken());
    if (!currentToken || !sheetMeta) throw new Error('Not authenticated with Google Sheets.');

    setIsSyncing(true);
    try {
      if (direction === 'push') {
        await syncFullDatasetToSheet(currentToken, sheetMeta.spreadsheetId, expenses);
        setExpenses((prev) => prev.map((item) => ({ ...item, syncedToSheet: true })));
        setSheetMeta((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null));
      } else {
        const sheetExpenses = await fetchExpensesFromSheet(currentToken, sheetMeta.spreadsheetId);
        setExpenses(sheetExpenses);
        setSheetMeta((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Add or Edit Expense handler
  const handleSaveExpense = async (
    itemData: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>
  ) => {
    if (editingItem) {
      // Update existing item
      const updatedItem: ExpenseItem = {
        ...editingItem,
        ...itemData,
        updatedAt: new Date().toISOString(),
        syncedToSheet: false,
      };

      const updatedList = expenses.map((item) => (item.id === editingItem.id ? updatedItem : item));
      setExpenses(updatedList);
      showNotice(`Updated "${updatedItem.title}"`);

      // Try syncing to Google Sheet in background
      if (token && sheetMeta) {
        try {
          await updateExpenseInSheet(token, sheetMeta.spreadsheetId, updatedItem);
          setExpenses((prev) =>
            prev.map((it) => (it.id === updatedItem.id ? { ...it, syncedToSheet: true } : it))
          );
        } catch (e) {
          console.warn('Background sheet update deferred:', e);
        }
      }
    } else {
      // Create new item
      const newItem: ExpenseItem = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedToSheet: false,
      };

      const updatedList = [newItem, ...expenses];
      setExpenses(updatedList);
      showNotice(`Logged "${newItem.title}"`);

      // Sync to Google Sheet
      if (token && sheetMeta) {
        try {
          await appendExpenseToSheet(token, sheetMeta.spreadsheetId, newItem);
          setExpenses((prev) =>
            prev.map((it) => (it.id === newItem.id ? { ...it, syncedToSheet: true } : it))
          );
        } catch (e) {
          console.warn('Background sheet append deferred:', e);
        }
      }
    }
    setEditingItem(null);
  };

  // Delete Expense handler (with explicit confirmation)
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);

    const targetId = deleteCandidate.id;
    const targetRowIndex = deleteCandidate.rowIndex;
    const itemTitle = deleteCandidate.title;

    try {
      // If connected to Google Sheet, delete from sheet
      if (token && sheetMeta) {
        try {
          await deleteExpenseFromSheet(token, sheetMeta.spreadsheetId, targetId, targetRowIndex);
        } catch (sheetErr) {
          console.warn('Could not delete directly from sheet, updating sheet dataset:', sheetErr);
        }
      }

      setExpenses((prev) => prev.filter((item) => item.id !== targetId));
      showNotice(`Deleted "${itemTitle}"`);
    } catch (err: any) {
      console.error('Delete error:', err);
      showNotice(`Error deleting item: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteCandidate(null);
    }
  };

  // Filtered expenses & analytics computations
  const filteredList = useMemo(() => filterExpenses(expenses, filter), [expenses, filter]);
  const analytics = useMemo(() => computeAnalytics(expenses), [expenses]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col font-sans selection:bg-[#BB86FC]/30 selection:text-[#BB86FC]">
      {/* App Header */}
      <Header
        user={user}
        sheetMeta={sheetMeta}
        isSyncing={isSyncing}
        onOpenAddModal={() => {
          setEditingItem(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onManualSync={handleManualSync}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Floating Notification Toast */}
      {syncNotice && (
        <div
          id="app-notification-toast"
          className="fixed bottom-6 right-6 z-50 bg-[#1F1F1F] text-[#E5E5E5] px-4 py-3 rounded-xl shadow-2xl border border-[#2A2A2A] flex items-center space-x-2 text-xs sm:text-sm animate-bounce"
        >
          <CheckCircle2 className="w-4 h-4 text-[#03DAC6] shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Google Sheets Connection Banner for unauthenticated state */}
        {!user && (
          <div
            id="banner-connect-sheets"
            className="bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-lg bg-[#182A24] border border-[#1E4035] text-[#03DAC6] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
                  Google Drive Cloud Sync
                </p>
                <h3 className="text-sm sm:text-base font-light text-[#E5E5E5] mt-0.5">
                  Connect your Google Sheets & Drive
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-0.5">
                  Seamlessly sync your personal transactions to a dedicated Google Spreadsheet in real time.
                </p>
              </div>
            </div>
            <button
              id="banner-signin-btn"
              onClick={handleSignIn}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#BB86FC] hover:bg-[#A370DB] text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0"
            >
              <span>Connect with Google</span>
            </button>
          </div>
        )}

        {/* Global Summary KPI Cards */}
        <SummaryCards analytics={analytics} budget={budget} />

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Analytics Visualizations in Overview */}
            <AnalyticsView analytics={analytics} expenses={expenses} budget={budget} />

            {/* Recent Transactions Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
                    Activity Stream
                  </p>
                  <h3 className="text-lg font-light text-[#E5E5E5] mt-0.5">Recent Transactions</h3>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-bold uppercase tracking-wider text-[#BB86FC] hover:text-[#D1A8FF] transition-colors"
                >
                  View All ({expenses.length}) →
                </button>
              </div>
              <ExpenseList
                expenses={expenses.slice(0, 7)}
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
          </div>
        )}

        {activeTab === 'transactions' && (
          <ExpenseList
            expenses={filteredList}
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
            onExport={() => exportToCSV(filteredList)}
            budget={budget}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} expenses={expenses} budget={budget} />
        )}

        {activeTab === 'budget' && (
          <BudgetManager budget={budget} onUpdateBudget={setBudget} analytics={analytics} />
        )}
      </main>

      {/* Modals */}
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

      <DeleteConfirmModal
        isOpen={!!deleteCandidate}
        item={deleteCandidate}
        currency={budget.currency}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
        isDeleting={isDeleting}
      />

      <SheetSettingsModal
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        sheetMeta={sheetMeta}
        userEmail={user?.email || null}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}
