import React from 'react';
import { User } from 'firebase/auth';
import {
  Wallet,
  Plus,
  Table,
  RefreshCw,
  ExternalLink,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { SheetMetadata } from '../types';

interface HeaderProps {
  user: User | null;
  sheetMeta: SheetMetadata | null;
  isSyncing: boolean;
  onOpenAddModal: () => void;
  onOpenSheetSettings: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onManualSync: () => void;
  activeTab: 'dashboard' | 'transactions' | 'analytics' | 'budget';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'analytics' | 'budget') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  sheetMeta,
  isSyncing,
  onOpenAddModal,
  onOpenSheetSettings,
  onSignIn,
  onSignOut,
  onManualSync,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header id="main-header" className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-sm bg-[#BB86FC] flex items-center justify-center text-black font-bold shadow-xs">
              <Wallet className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl text-[#E5E5E5] tracking-tight">
                  EXPENSE<span className="text-[#BB86FC]">MANAGER</span>
                </span>
              </div>
              <p className="text-[11px] text-[#9E9E9E] hidden sm:block">
                Personal expense tracking & Google Sheets sync
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#161616] p-1 rounded-xl border border-[#2A2A2A]">
            <button
              id="nav-dashboard-tab"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#1F1F1F]'
              }`}
            >
              Overview
            </button>
            <button
              id="nav-transactions-tab"
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'transactions'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#1F1F1F]'
              }`}
            >
              Transactions
            </button>
            <button
              id="nav-analytics-tab"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#1F1F1F]'
              }`}
            >
              Analytics
            </button>
            <button
              id="nav-budget-tab"
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'budget'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#1F1F1F]'
              }`}
            >
              Budgets
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Google Sheets Sync Pill */}
            {user ? (
              <div className="flex items-center space-x-1.5">
                <button
                  id="header-sheet-status-btn"
                  onClick={onOpenSheetSettings}
                  title="Google Sheet Integration Status"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B2521] text-[#03DAC6] border border-[#03DAC6]/30 hover:bg-[#20332C] transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#03DAC6]" />
                  <span className="hidden lg:inline">Google Sheet</span>
                  {sheetMeta ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#03DAC6]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-[#CF6679]" />
                  )}
                </button>

                {sheetMeta && (
                  <>
                    <button
                      id="header-manual-sync-btn"
                      onClick={onManualSync}
                      disabled={isSyncing}
                      title="Sync with Google Sheet"
                      className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#03DAC6]' : ''}`}
                      />
                    </button>
                    <a
                      id="header-open-sheet-link"
                      href={sheetMeta.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Google Sheets"
                      className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2A2A2A] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            ) : null}

            {/* Google Sign In / User Profile */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 pl-2 border-l border-[#2A2A2A]">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-[#3A3A3A] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] flex items-center justify-center text-xs font-bold text-[#E5E5E5]">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    id="header-signout-btn"
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-1.5 text-[#9E9E9E] hover:text-[#CF6679] hover:bg-[#251D1B] rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="header-google-signin-btn"
                onClick={onSignIn}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#161616] text-[#E5E5E5] border border-[#2A2A2A] hover:bg-[#222222] transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span className="hidden sm:inline">Connect Sheets</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}

            {/* Add Expense Primary Button */}
            <button
              id="header-add-expense-btn"
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#BB86FC] text-black hover:bg-[#a86ef7] transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#2A2A2A]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
              activeTab === 'dashboard' ? 'bg-[#2A2A2A] text-white border border-[#3A3A3A]' : 'text-[#9E9E9E]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
              activeTab === 'transactions' ? 'bg-[#2A2A2A] text-white border border-[#3A3A3A]' : 'text-[#9E9E9E]'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
              activeTab === 'analytics' ? 'bg-[#2A2A2A] text-white border border-[#3A3A3A]' : 'text-[#9E9E9E]'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
              activeTab === 'budget' ? 'bg-[#2A2A2A] text-white border border-[#3A3A3A]' : 'text-[#9E9E9E]'
            }`}
          >
            Budgets
          </button>
        </div>
      </div>
    </header>
  );
};
