export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Housing & Utilities'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Health & Wellness'
  | 'Travel'
  | 'Education'
  | 'Bills & Subscriptions'
  | 'Personal Care'
  | 'Salary & Income'
  | 'Investments'
  | 'Other';

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Bank Transfer'
  | 'UPI / Digital Wallet'
  | 'Other';

export interface ExpenseItem {
  id: string;
  rowIndex?: number; // Row index in Google Sheets (2-indexed)
  date: string; // YYYY-MM-DD
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncedToSheet?: boolean;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  limit: number;
}

export interface BudgetConfig {
  monthlyTotalLimit: number;
  categoryBudgets: Record<string, number>;
  currency: string;
}

export interface SheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  lastSyncedAt: string | null;
}

export interface FilterState {
  search: string;
  type: 'all' | TransactionType;
  category: string;
  paymentMethod: string;
  dateRange: 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy: 'date' | 'amount' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  averageExpense: number;
  categoryTotals: Record<string, number>;
  monthlyTrends: { month: string; expense: number; income: number; net: number }[];
  dailySpending: { date: string; amount: number }[];
  paymentMethodTotals: Record<string, number>;
}
