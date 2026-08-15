import { ExpenseItem, ExpenseCategory, AnalyticsSummary, FilterState, BudgetConfig } from '../types';

export const CATEGORIES: { label: ExpenseCategory; icon: string; color: string; bgLight: string }[] = [
  { label: 'Food & Dining', icon: 'Utensils', color: '#FFB74D', bgLight: '#2C2214' },
  { label: 'Housing & Utilities', icon: 'Home', color: '#BB86FC', bgLight: '#241830' },
  { label: 'Transportation', icon: 'Car', color: '#03DAC6', bgLight: '#142926' },
  { label: 'Shopping', icon: 'ShoppingBag', color: '#F48FB1', bgLight: '#2D1722' },
  { label: 'Entertainment', icon: 'Film', color: '#B39DDB', bgLight: '#231B30' },
  { label: 'Health & Wellness', icon: 'HeartPulse', color: '#81C784', bgLight: '#172B1A' },
  { label: 'Travel', icon: 'Plane', color: '#FFE082', bgLight: '#2C2714' },
  { label: 'Education', icon: 'GraduationCap', color: '#9FA8DA', bgLight: '#1B1E30' },
  { label: 'Bills & Subscriptions', icon: 'Receipt', color: '#CF6679', bgLight: '#2A181C' },
  { label: 'Personal Care', icon: 'Sparkles', color: '#CE93D8', bgLight: '#27172B' },
  { label: 'Salary & Income', icon: 'Briefcase', color: '#03DAC6', bgLight: '#142926' },
  { label: 'Investments', icon: 'TrendingUp', color: '#4DB6AC', bgLight: '#142825' },
  { label: 'Other', icon: 'HelpCircle', color: '#9E9E9E', bgLight: '#222222' },
];

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'UPI / Digital Wallet',
  'Other',
] as const;

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const isINR = currency === '₹' || currency === 'INR';
  const formattedNumber = Math.abs(amount).toLocaleString(isINR ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${currency}${formattedNumber}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCategoryInfo(categoryName: string) {
  const match = CATEGORIES.find((c) => c.label === categoryName);
  return match || { label: 'Other', icon: 'HelpCircle', color: '#64748b', bgLight: '#f1f5f9' };
}

export function filterExpenses(items: ExpenseItem[], filter: FilterState): ExpenseItem[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return items.filter((item) => {
    // Search query
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchPayment = item.paymentMethod.toLowerCase().includes(q);
      const matchAmount = item.amount.toString().includes(q);
      if (!matchTitle && !matchNotes && !matchCat && !matchPayment && !matchAmount) return false;
    }

    // Type filter
    if (filter.type !== 'all' && item.type !== filter.type) {
      return false;
    }

    // Category filter
    if (filter.category && filter.category !== 'all' && item.category !== filter.category) {
      return false;
    }

    // Payment method filter
    if (filter.paymentMethod && filter.paymentMethod !== 'all' && item.paymentMethod !== filter.paymentMethod) {
      return false;
    }

    // Date range filter
    const itemDate = new Date(item.date + 'T00:00:00');
    if (filter.dateRange === 'this_month') {
      if (itemDate.getFullYear() !== currentYear || itemDate.getMonth() !== currentMonth) return false;
    } else if (filter.dateRange === 'last_month') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      if (itemDate.getFullYear() !== lastMonthYear || itemDate.getMonth() !== lastMonth) return false;
    } else if (filter.dateRange === 'this_year') {
      if (itemDate.getFullYear() !== currentYear) return false;
    } else if (filter.dateRange === 'custom') {
      if (filter.startDate && item.date < filter.startDate) return false;
      if (filter.endDate && item.date > filter.endDate) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filter.sortBy === 'date') {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return filter.sortOrder === 'asc' ? -diff : diff;
    }
    if (filter.sortBy === 'amount') {
      return filter.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    if (filter.sortBy === 'title') {
      return filter.sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return 0;
  });
}

export function computeAnalytics(items: ExpenseItem[]): AnalyticsSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};
  const paymentMethodTotals: Record<string, number> = {};
  const dailyMap: Record<string, number> = {};
  const monthMap: Record<string, { expense: number; income: number }> = {};

  items.forEach((item) => {
    if (item.type === 'income') {
      totalIncome += item.amount;
    } else {
      totalExpense += item.amount;
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
      paymentMethodTotals[item.paymentMethod] = (paymentMethodTotals[item.paymentMethod] || 0) + item.amount;
      
      // Daily map for expenses
      dailyMap[item.date] = (dailyMap[item.date] || 0) + item.amount;
    }

    // Monthly breakdown
    const mKey = item.date.substring(0, 7); // YYYY-MM
    if (!monthMap[mKey]) {
      monthMap[mKey] = { expense: 0, income: 0 };
    }
    if (item.type === 'income') {
      monthMap[mKey].income += item.amount;
    } else {
      monthMap[mKey].expense += item.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;
  const expenseCount = items.filter((i) => i.type === 'expense').length;
  const averageExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;

  // Format monthly trends sorted chronologically
  const sortedMonthKeys = Object.keys(monthMap).sort();
  const monthlyTrends = sortedMonthKeys.map((key) => {
    const [year, month] = key.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const { expense, income } = monthMap[key];
    return {
      month: monthLabel,
      expense,
      income,
      net: income - expense,
    };
  });

  // Daily spending for recent 14 days with activity
  const sortedDates = Object.keys(dailyMap).sort().slice(-14);
  const dailySpending = sortedDates.map((d) => ({
    date: formatDate(d).replace(/, \d{4}$/, ''),
    amount: dailyMap[d],
  }));

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    transactionCount: items.length,
    averageExpense,
    categoryTotals,
    monthlyTrends,
    dailySpending,
    paymentMethodTotals,
  };
}

export function exportToCSV(items: ExpenseItem[]): void {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes', 'Created At'];
  const rows = items.map((i) => [
    `"${i.id}"`,
    `"${i.date}"`,
    `"${i.type}"`,
    `"${i.category}"`,
    `"${i.title.replace(/"/g, '""')}"`,
    i.amount,
    `"${i.paymentMethod}"`,
    `"${(i.notes || '').replace(/"/g, '""')}"`,
    `"${i.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `personal_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
