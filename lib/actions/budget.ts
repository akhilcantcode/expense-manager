'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { BudgetConfig } from '../../src/types';

const DEFAULT_BUDGET: BudgetConfig = {
  monthlyTotalLimit: 50000,
  currency: '₹',
  categoryBudgets: {
    'Food & Dining': 12000,
    'Housing & Utilities': 18000,
    'Transportation': 4000,
    'Shopping': 5000,
    'Entertainment': 3000,
    'Health & Wellness': 2500,
    'Bills & Subscriptions': 2500,
    'Other': 2000,
  },
};

export async function getBudget(): Promise<BudgetConfig> {
  const { userId } = await auth();
  if (!userId) {
    return DEFAULT_BUDGET;
  }

  try {
    const config = await prisma.budgetConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      return DEFAULT_BUDGET;
    }

    return {
      monthlyTotalLimit: config.monthlyTotalLimit,
      currency: config.currency,
      categoryBudgets: (config.categoryBudgets as Record<string, number>) || DEFAULT_BUDGET.categoryBudgets,
    };
  } catch (err) {
    console.error('Failed to get budget from database:', err);
    return DEFAULT_BUDGET;
  }
}

export async function saveBudget(budget: BudgetConfig): Promise<BudgetConfig> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const saved = await prisma.budgetConfig.upsert({
    where: { userId },
    create: {
      userId,
      monthlyTotalLimit: budget.monthlyTotalLimit,
      currency: budget.currency,
      categoryBudgets: budget.categoryBudgets,
    },
    update: {
      monthlyTotalLimit: budget.monthlyTotalLimit,
      currency: budget.currency,
      categoryBudgets: budget.categoryBudgets,
    },
  });

  revalidatePath('/');

  return {
    monthlyTotalLimit: saved.monthlyTotalLimit,
    currency: saved.currency,
    categoryBudgets: (saved.categoryBudgets as Record<string, number>) || {},
  };
}
