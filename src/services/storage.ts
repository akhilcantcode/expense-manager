import { ExpenseItem, BudgetConfig, SheetMetadata } from '../types';

const EXPENSES_STORAGE_KEY = 'expense_manager_items_v2';
const BUDGET_STORAGE_KEY = 'expense_manager_budget_v2';
const SHEET_META_KEY = 'expense_manager_sheet_meta_v2';

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
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

export const INITIAL_SAMPLE_EXPENSES: ExpenseItem[] = [];

export function loadStoredExpenses(): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      saveStoredExpenses([]);
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local expenses:', e);
    return [];
  }
}

export function saveStoredExpenses(items: ExpenseItem[]): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save local expenses:', e);
  }
}

export function loadStoredBudget(): BudgetConfig {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) {
      saveStoredBudget(DEFAULT_BUDGET_CONFIG);
      return DEFAULT_BUDGET_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (parsed.currency === '$' || !parsed.currency) {
      parsed.currency = '₹';
      if (parsed.monthlyTotalLimit === 3000) {
        parsed.monthlyTotalLimit = 50000;
      }
    }
    return { ...DEFAULT_BUDGET_CONFIG, ...parsed };
  } catch (e) {
    return DEFAULT_BUDGET_CONFIG;
  }
}

export function saveStoredBudget(config: BudgetConfig): void {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save budget config:', e);
  }
}

export function loadStoredSheetMeta(): SheetMetadata | null {
  try {
    const raw = localStorage.getItem(SHEET_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveStoredSheetMeta(meta: SheetMetadata | null): void {
  try {
    if (meta) {
      localStorage.setItem(SHEET_META_KEY, JSON.stringify(meta));
    } else {
      localStorage.removeItem(SHEET_META_KEY);
    }
  } catch (e) {
    console.error('Failed to save sheet meta:', e);
  }
}
