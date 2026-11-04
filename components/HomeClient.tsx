'use client';

import React, { useState } from 'react';
import { LandingPage } from './LandingPage';
import { Dashboard } from './Dashboard';
import { ExpenseItem, BudgetConfig } from '../src/types';

interface HomeClientProps {
  userId: string | null;
  initialExpenses: ExpenseItem[];
  initialBudget: BudgetConfig;
}

export function HomeClient({
  userId,
  initialExpenses,
  initialBudget,
}: HomeClientProps) {
  const [viewDemo, setViewDemo] = useState(false);

  if (userId || viewDemo) {
    return (
      <div>
        {!userId && (
          <div className="bg-[#141414] px-4 py-2 text-xs flex items-center justify-between">
            <span className="text-[#a3a3a3]">
              Exploring guest interactive sandbox. Sign in.
            </span>
            <button
              onClick={() => setViewDemo(false)}
              className="text-[#c6f24e] hover:underline font-medium cursor-pointer"
            >
              Back to landing overview
            </button>
          </div>
        )}
        <Dashboard
          initialExpenses={initialExpenses}
          initialBudget={initialBudget}
        />
      </div>
    );
  }

  return <LandingPage onEnterDemo={() => setViewDemo(true)} />;
}
