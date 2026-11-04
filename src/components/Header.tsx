'use client';

import React from 'react';
import {
  Plus,
  RefreshCw,
  Database,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import {
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';

interface HeaderProps {
  onOpenAddModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeTab: 'dashboard' | 'transactions' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onRefresh,
  isRefreshing = false,
  activeTab,
  setActiveTab,
}) => {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <header id="main-header" className="bg-black border-b border-neutral-900 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base sm:text-lg text-white tracking-tight">
                  kharche.
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#111111] p-1 rounded-lg border border-neutral-800">
            <button
              id="nav-dashboard-tab"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
            >
              Overview
            </button>
            <button
              id="nav-transactions-tab"
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'transactions'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
            >
              Transactions
            </button>
            <button
              id="nav-analytics-tab"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
            >
              Analytics
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Database & Refresh status badge */}
            {isSignedIn && (
              <div className="flex items-center space-x-1.5">
                {/* <div
                  title="Connected to Neon Serverless PostgreSQL via Prisma"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-neutral-300 border border-neutral-800"
                >
                  <Database className="w-3.5 h-3.5 text-[#c6f24e]" />
                  <span className="hidden sm:inline">Neon DB</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c6f24e]" />
                </div> */}

                {onRefresh && (
                  <button
                    id="header-refresh-btn"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Refresh data from database"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#c6f24e]' : ''}`}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Clerk User Button / Sign In */}
            <div className="flex items-center">
              {isSignedIn ? (
                <div className="pl-2 border-l border-neutral-800 flex items-center">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8 rounded-full border border-neutral-700',
                      },
                    }}
                  />
                </div>
              ) : isLoaded ? (
                <SignInButton mode="modal">
                  <button
                    id="header-clerk-signin-btn"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#111111] text-white border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#c6f24e]" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              ) : null}
            </div>

            {/* Add Expense Primary Button */}
            <button
              id="header-add-expense-btn"
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-neutral-900 px-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeTab === 'transactions' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
              }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeTab === 'analytics' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
              }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
};
