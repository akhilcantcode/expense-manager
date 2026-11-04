'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ExpenseItem, AnalyticsSummary, BudgetConfig } from '../types';
import { CATEGORIES, formatCurrency, getCategoryInfo } from '../utils/helpers';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary;
  expenses: ExpenseItem[];
  budget?: BudgetConfig;
  currency?: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  expenses,
  budget,
  currency = '₹',
}) => {
  const activeCurrency = currency || budget?.currency || '₹';
  const [chartTimeframe, setChartTimeframe] = useState<'all' | 'monthly'>('monthly');

  // Bar Graph Date Filtering State
  const [barDatePreset, setBarDatePreset] = useState<'all' | '7days' | '30days' | 'this_month' | 'custom'>('30days');
  const [barStartDate, setBarStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [barEndDate, setBarEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [barViewType, setBarViewType] = useState<'expenses' | 'both'>('expenses');

  // Handle Preset Change for Bar Chart
  const handleBarPresetChange = (preset: 'all' | '7days' | '30days' | 'this_month' | 'custom') => {
    setBarDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === '7days') {
      const start = new Date();
      start.setDate(today.getDate() - 7);
      setBarStartDate(start.toISOString().split('T')[0]);
      setBarEndDate(todayStr);
    } else if (preset === '30days') {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      setBarStartDate(start.toISOString().split('T')[0]);
      setBarEndDate(todayStr);
    } else if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setBarStartDate(start.toISOString().split('T')[0]);
      setBarEndDate(todayStr);
    } else if (preset === 'all') {
      setBarStartDate('');
      setBarEndDate('');
    }
  };

  // Filtered daily dataset for Bar Chart based on date range
  const filteredDailyData = React.useMemo(() => {
    const dailyMap: Record<string, { date: string; displayDate: string; expense: number; income: number }> = {};

    expenses.forEach((item) => {
      if (barStartDate && item.date < barStartDate) return;
      if (barEndDate && item.date > barEndDate) return;

      if (!dailyMap[item.date]) {
        const d = new Date(item.date + 'T00:00:00');
        const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyMap[item.date] = { date: item.date, displayDate, expense: 0, income: 0 };
      }

      if (item.type === 'expense') {
        dailyMap[item.date].expense += item.amount;
      } else {
        dailyMap[item.date].income += item.amount;
      }
    });

    return Object.values(dailyMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [expenses, barStartDate, barEndDate]);

  const filteredBarStats = React.useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    filteredDailyData.forEach((d) => {
      totalExpense += d.expense;
      totalIncome += d.income;
    });
    const daysCount = filteredDailyData.length;
    const avgExpense = daysCount > 0 ? totalExpense / daysCount : 0;
    return { totalExpense, totalIncome, avgExpense, daysCount };
  }, [filteredDailyData]);

  // Prepare Pie Chart Data for categories
  const categoryData = Object.entries(analytics.categoryTotals)
    .filter(([_, amount]) => Number(amount) > 0)
    .map(([category, amount]) => {
      const numAmount = Number(amount);
      const catInfo = getCategoryInfo(category);
      const percentage =
        analytics.totalExpense > 0 ? (numAmount / analytics.totalExpense) * 100 : 0;
      return {
        name: category,
        value: numAmount,
        percentage: Number(percentage.toFixed(1)),
        color: catInfo.color,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Prepare Payment Method Data
  const paymentData = Object.entries(analytics.paymentMethodTotals)
    .filter(([_, amount]) => Number(amount) > 0)
    .map(([method, amount]) => ({
      name: method,
      amount: Number(amount),
    }))
    .sort((a, b) => b.amount - a.amount);

  const paymentColors = ['#BB86FC', '#03DAC6', '#CF6679', '#FFB74D', '#B39DDB', '#4DB6AC'];

  // Top 3 Expense Items
  const topExpenseItems = expenses
    .filter((item) => item.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const customTooltipFormatter = (value: number) => {
    return [formatCurrency(Number(value), activeCurrency)];
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] p-5 sm:p-6 rounded-xl border border-neutral-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Financial Insights & Trends
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Aggregated metrics and spending breakdown over time
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg bg-neutral-900 p-1 border border-neutral-800 text-xs font-medium">
            <button
              id="analytics-view-monthly-btn"
              onClick={() => setChartTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                chartTimeframe === 'monthly'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              id="analytics-view-all-btn"
              onClick={() => setChartTimeframe('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                chartTimeframe === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All time
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Income vs Expense Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Income vs Expenses Cashflow Trend */}
        <div className="lg:col-span-7 bg-[#111111] p-6 rounded-xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white text-base">
              Cash Inflow vs Outflow
            </h3>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-[#c6f24e] mr-1.5" /> Income
              </span>
              <span className="flex items-center text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-[#e5484d] mr-1.5" /> Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            {analytics.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.monthlyTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222222" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: '#222222' }}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    tickFormatter={(v) => `${activeCurrency}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #222222',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#c6f24e"
                    strokeWidth={2}
                    fill="#c6f24e"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#e5484d"
                    strokeWidth={2}
                    fill="#e5484d"
                    fillOpacity={0.08}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400 text-xs">
                No trend telemetry available yet.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-5 bg-[#111111] p-6 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-white text-base">
              Expense Distribution
            </h3>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111111" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #222222',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-neutral-400 text-xs">No category data recorded.</div>
            )}

            {/* Center Label for Donut */}
            {categoryData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-neutral-400 font-medium">Spent</span>
                <span className="text-base font-semibold text-white">
                  {formatCurrency(analytics.totalExpense, activeCurrency)}
                </span>
              </div>
            )}
          </div>

          {/* Category List under Donut */}
          <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {categoryData.slice(0, 5).map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 border-b border-neutral-800 last:border-0"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-white font-medium truncate max-w-[130px]">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-400 text-xs">{cat.percentage}%</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(cat.value, activeCurrency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Filterable Daily Spending Bar Graph & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daily Spending Pulse with Date-to-Date Filtering */}
        <div id="analytics-daily-barchart-container" className="lg:col-span-7 bg-[#111111] p-6 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-medium text-white text-base">
              Activity by Date
            </h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-neutral-400">Range total:</span>
              <span className="font-semibold text-white">
                {formatCurrency(filteredBarStats.totalExpense, activeCurrency)}
              </span>
            </div>
          </div>

          {/* Date Filter Controls & Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 pb-2 border-b border-neutral-800">
            {/* Quick Presets */}
            <div className="inline-flex items-center rounded-lg bg-neutral-900 p-0.5 border border-neutral-800 text-xs font-medium">
              <button
                type="button"
                id="bar-filter-7d"
                onClick={() => handleBarPresetChange('7days')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  barDatePreset === '7days'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                id="bar-filter-30d"
                onClick={() => handleBarPresetChange('30days')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  barDatePreset === '30days'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                id="bar-filter-month"
                onClick={() => handleBarPresetChange('this_month')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  barDatePreset === 'this_month'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                id="bar-filter-all"
                onClick={() => handleBarPresetChange('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  barDatePreset === 'all'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All
              </button>
            </div>

            {/* Custom Date Pickers */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1.5 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-400 font-medium">From:</span>
                <input
                  type="date"
                  id="bar-start-date"
                  value={barStartDate}
                  onChange={(e) => {
                    setBarStartDate(e.target.value);
                    setBarDatePreset('custom');
                  }}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                <span className="text-xs text-neutral-400 font-medium">To:</span>
                <input
                  type="date"
                  id="bar-end-date"
                  value={barEndDate}
                  onChange={(e) => {
                    setBarEndDate(e.target.value);
                    setBarDatePreset('custom');
                  }}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full pt-2">
            {filteredDailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredDailyData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222222" />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={{ stroke: '#222222' }}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    tickFormatter={(v) => `${activeCurrency}${v}`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatCurrency(Number(val), activeCurrency),
                      name === 'expense' ? 'Expense' : 'Income',
                    ]}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0] && payload[0].payload) {
                        return `Date: ${payload[0].payload.date}`;
                      }
                      return '';
                    }}
                    contentStyle={{
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #222222',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="expense"
                    name="expense"
                    fill="#ffffff"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs space-y-1">
                <Calendar className="w-6 h-6 text-neutral-600" />
                <p>No transactions found for the selected date range.</p>
                <button
                  onClick={() => handleBarPresetChange('all')}
                  className="text-xs text-neutral-300 hover:underline font-medium mt-1 cursor-pointer"
                >
                  View all dates
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <span>
              Showing {filteredDailyData.length} active day{filteredDailyData.length === 1 ? '' : 's'}
            </span>
            <span>
              Daily avg:{' '}
              <strong className="text-white font-semibold">
                {formatCurrency(filteredBarStats.avgExpense, activeCurrency)}
              </strong>
            </span>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="lg:col-span-5 bg-[#111111] p-6 rounded-xl border border-neutral-800">
          <div className="mb-4">
            <h3 className="font-medium text-white text-base">
              Settlement Methods
            </h3>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222222" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #222222',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#ffffff" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={paymentColors[index % paymentColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-neutral-400 text-xs">No payment method records.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Top Transactions & Key Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top 5 Largest Expenses */}
        <div className="lg:col-span-8 bg-[#111111] p-6 rounded-xl border border-neutral-800">
          <h3 className="font-medium text-white text-base mb-4">
            Largest Transactions
          </h3>
          <div className="space-y-2">
            {topExpenseItems.length > 0 ? (
              topExpenseItems.map((item, index) => {
                const cat = getCategoryInfo(item.category);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-medium">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-white">{item.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-neutral-400 mt-0.5">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#e5484d] text-sm">
                        -{formatCurrency(item.amount, activeCurrency)}
                      </span>
                      <p className="text-xs text-neutral-400">{item.paymentMethod}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-neutral-400">No recorded expenses yet.</p>
            )}
          </div>
        </div>

        {/* Smart Financial Highlights */}
        <div className="lg:col-span-4 bg-[#111111] border border-neutral-800 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="font-semibold text-sm text-white">
                Financial Health
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-xs block mb-1">
                  Savings performance
                </span>
                <p className="text-sm font-semibold text-white">
                  {analytics.savingsRate >= 20 ? (
                    <span className="text-[#c6f24e]">Solid ({analytics.savingsRate.toFixed(1)}% saved)</span>
                  ) : (
                    <span className="text-[#e5a93b]">Moderate ({analytics.savingsRate.toFixed(1)}% saved)</span>
                  )}
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  Net surplus: {formatCurrency(analytics.netSavings, activeCurrency)}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-xs block mb-1">
                  Primary outflow category
                </span>
                <p className="text-sm font-semibold text-white">
                  {categoryData[0]?.name || 'N/A'} (
                  {categoryData[0] ? formatCurrency(categoryData[0].value, activeCurrency) : '$0'}
                  )
                </p>
              </div>

              <div className="p-3.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-xs block mb-1">
                  Active categories
                </span>
                <p className="text-sm font-semibold text-white">
                  {categoryData.length} {categoryData.length === 1 ? 'category' : 'categories'} tracked
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  {expenses.length} total transaction records
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
