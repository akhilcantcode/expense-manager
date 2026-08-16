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
  budget: BudgetConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  expenses,
  budget,
}) => {
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
    return [formatCurrency(Number(value), budget.currency)];
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 sm:p-6 rounded-xl border border-[#2A2A2A] shadow-xs">
        <div>
          <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
            Analytics & Telemetry
          </p>
          <h2 className="text-xl sm:text-2xl font-light text-[#E5E5E5] tracking-tight mt-1">
            Financial Insights & Trends
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg bg-[#0A0A0A] p-1 border border-[#2A2A2A] text-xs font-semibold">
            <button
              id="analytics-view-monthly-btn"
              onClick={() => setChartTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                chartTimeframe === 'monthly'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
              }`}
            >
              Monthly
            </button>
            <button
              id="analytics-view-all-btn"
              onClick={() => setChartTimeframe('all')}
              className={`px-3 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                chartTimeframe === 'all'
                  ? 'bg-[#2A2A2A] text-white shadow-xs border border-[#3A3A3A]'
                  : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Income vs Expense Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Cashflow Trend */}
        <div className="lg:col-span-7 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
                Spending Trends
              </p>
              <h3 className="font-light text-[#E5E5E5] text-base mt-0.5">
                Cash Inflow vs Outflow
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center text-[#03DAC6]">
                <span className="w-2 h-2 rounded-full bg-[#03DAC6] mr-1.5" /> Income
              </span>
              <span className="flex items-center text-[#BB86FC]">
                <span className="w-2 h-2 rounded-full bg-[#BB86FC] mr-1.5" /> Expense
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
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#03DAC6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#03DAC6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BB86FC" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#BB86FC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tick={{ fill: '#9E9E9E', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9E9E9E', fontSize: 11 }}
                    tickFormatter={(v) => `${budget.currency}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#161616',
                      color: '#E5E5E5',
                      borderRadius: '8px',
                      border: '1px solid #2A2A2A',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#03DAC6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#BB86FC"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9E9E9E] text-xs">
                No trend telemetry available yet.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-5 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
                Category Mix
              </p>
              <h3 className="font-light text-[#E5E5E5] text-base mt-0.5">
                Expense Distribution
              </h3>
            </div>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#161616" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#161616',
                      color: '#E5E5E5',
                      borderRadius: '8px',
                      border: '1px solid #2A2A2A',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#9E9E9E] text-xs">No category data recorded.</div>
            )}

            {/* Center Label for Donut */}
            {categoryData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-widest">Spent</span>
                <span className="text-base font-bold text-[#E5E5E5]">
                  {formatCurrency(analytics.totalExpense, budget.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Category List under Donut */}
          <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {categoryData.slice(0, 5).map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 border-b border-[#222222] last:border-0"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#E5E5E5] font-medium truncate max-w-[130px]">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#9E9E9E] font-mono text-[11px]">{cat.percentage}%</span>
                  <span className="text-[#E5E5E5] font-semibold">
                    {formatCurrency(cat.value, budget.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Filterable Daily Spending Bar Graph & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Spending Pulse with Date-to-Date Filtering */}
        <div id="analytics-daily-barchart-container" className="lg:col-span-7 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
                Daily Timeline Graph
              </p>
              <h3 className="font-light text-[#E5E5E5] text-base mt-0.5">
                Activity by Date
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#9E9E9E]">Range Total:</span>
              <span className="font-bold text-[#E5E5E5]">
                {formatCurrency(filteredBarStats.totalExpense, budget.currency)}
              </span>
            </div>
          </div>

          {/* Date Filter Controls & Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 pb-2 border-b border-[#222222]">
            {/* Quick Presets */}
            <div className="inline-flex items-center rounded-lg bg-[#0A0A0A] p-0.5 border border-[#2A2A2A] text-[11px] font-semibold">
              <button
                type="button"
                id="bar-filter-7d"
                onClick={() => handleBarPresetChange('7days')}
                className={`px-2.5 py-1 rounded uppercase tracking-wider transition-all ${
                  barDatePreset === '7days'
                    ? 'bg-[#2A2A2A] text-white shadow-xs'
                    : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                id="bar-filter-30d"
                onClick={() => handleBarPresetChange('30days')}
                className={`px-2.5 py-1 rounded uppercase tracking-wider transition-all ${
                  barDatePreset === '30days'
                    ? 'bg-[#2A2A2A] text-white shadow-xs'
                    : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                id="bar-filter-month"
                onClick={() => handleBarPresetChange('this_month')}
                className={`px-2.5 py-1 rounded uppercase tracking-wider transition-all ${
                  barDatePreset === 'this_month'
                    ? 'bg-[#2A2A2A] text-white shadow-xs'
                    : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                id="bar-filter-all"
                onClick={() => handleBarPresetChange('all')}
                className={`px-2.5 py-1 rounded uppercase tracking-wider transition-all ${
                  barDatePreset === 'all'
                    ? 'bg-[#2A2A2A] text-white shadow-xs'
                    : 'text-[#9E9E9E] hover:text-[#E5E5E5]'
                }`}
              >
                All
              </button>
            </div>

            {/* Custom Date Pickers */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1.5 bg-[#0A0A0A] px-2.5 py-1 rounded-lg border border-[#2A2A2A]">
                <Calendar className="w-3 h-3 text-[#9E9E9E]" />
                <span className="text-[10px] text-[#9E9E9E] uppercase font-semibold">From:</span>
                <input
                  type="date"
                  id="bar-start-date"
                  value={barStartDate}
                  onChange={(e) => {
                    setBarStartDate(e.target.value);
                    setBarDatePreset('custom');
                  }}
                  className="bg-transparent text-[#E5E5E5] text-xs outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-[#0A0A0A] px-2.5 py-1 rounded-lg border border-[#2A2A2A]">
                <span className="text-[10px] text-[#9E9E9E] uppercase font-semibold">To:</span>
                <input
                  type="date"
                  id="bar-end-date"
                  value={barEndDate}
                  onChange={(e) => {
                    setBarEndDate(e.target.value);
                    setBarDatePreset('custom');
                  }}
                  className="bg-transparent text-[#E5E5E5] text-xs outline-none cursor-pointer [color-scheme:dark]"
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tick={{ fill: '#9E9E9E', fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9E9E9E', fontSize: 10 }}
                    tickFormatter={(v) => `${budget.currency}${v}`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatCurrency(Number(val), budget.currency),
                      name === 'expense' ? 'Expense' : 'Income',
                    ]}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0] && payload[0].payload) {
                        return `Date: ${payload[0].payload.date}`;
                      }
                      return '';
                    }}
                    contentStyle={{
                      backgroundColor: '#161616',
                      color: '#E5E5E5',
                      borderRadius: '8px',
                      border: '1px solid #2A2A2A',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="expense"
                    name="expense"
                    fill="#BB86FC"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9E9E9E] text-xs space-y-1">
                <Calendar className="w-6 h-6 text-[#444444]" />
                <p>No transactions found for the selected date range.</p>
                <button
                  onClick={() => handleBarPresetChange('all')}
                  className="text-xs text-[#BB86FC] hover:underline font-medium mt-1"
                >
                  View all dates
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#9E9E9E] pt-1">
            <span>
              Showing {filteredDailyData.length} active day{filteredDailyData.length === 1 ? '' : 's'}
            </span>
            <span>
              Daily Avg:{' '}
              <strong className="text-[#E5E5E5]">
                {formatCurrency(filteredBarStats.avgExpense, budget.currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="lg:col-span-5 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs">
          <div className="mb-4">
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
              Payment Channels
            </p>
            <h3 className="font-light text-[#E5E5E5] text-base mt-0.5">
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
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2A2A2A" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9E9E9E', fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: '#161616',
                      color: '#E5E5E5',
                      borderRadius: '8px',
                      border: '1px solid #2A2A2A',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#BB86FC" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={paymentColors[index % paymentColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#9E9E9E] text-xs">No payment method records.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Top Transactions & Key Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Largest Expenses */}
        <div className="lg:col-span-8 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] shadow-xs">
          <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold mb-1">
            Outflow Breakdown
          </p>
          <h3 className="font-light text-[#E5E5E5] text-base mb-4">
            Largest Transactions
          </h3>
          <div className="space-y-2">
            {topExpenseItems.length > 0 ? (
              topExpenseItems.map((item, index) => {
                const cat = getCategoryInfo(item.category);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#202020] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded bg-[#2A2A2A] text-[#BB86FC] flex items-center justify-center text-xs font-bold">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#E5E5E5]">{item.title}</h4>
                        <div className="flex items-center space-x-2 text-[11px] text-[#9E9E9E] mt-0.5">
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
                      <span className="font-mono font-bold text-[#CF6679] text-sm">
                        -{formatCurrency(item.amount, budget.currency)}
                      </span>
                      <p className="text-[10px] text-[#9E9E9E]">{item.paymentMethod}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#9E9E9E]">No recorded expenses yet.</p>
            )}
          </div>
        </div>

        {/* Smart Financial Highlights */}
        <div className="lg:col-span-4 bg-[#161616] border border-[#2A2A2A] p-6 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#BB86FC]" />
              <h3 className="font-semibold text-sm text-[#E5E5E5] uppercase tracking-wider">
                Financial Health
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <span className="text-[#9E9E9E] text-[10px] uppercase tracking-widest block mb-1">
                  Savings Performance
                </span>
                <p className="text-sm font-bold text-[#E5E5E5]">
                  {analytics.savingsRate >= 20 ? (
                    <span className="text-[#03DAC6]">Solid ({analytics.savingsRate.toFixed(1)}% saved)</span>
                  ) : (
                    <span className="text-[#FFB74D]">Moderate ({analytics.savingsRate.toFixed(1)}% saved)</span>
                  )}
                </p>
                <p className="text-[#9E9E9E] text-[11px] mt-1 font-mono">
                  Net surplus: {formatCurrency(analytics.netSavings, budget.currency)}
                </p>
              </div>

              <div className="p-3.5 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <span className="text-[#9E9E9E] text-[10px] uppercase tracking-widest block mb-1">
                  Primary Outflow Category
                </span>
                <p className="text-sm font-bold text-[#E5E5E5]">
                  {categoryData[0]?.name || 'N/A'} (
                  {categoryData[0] ? formatCurrency(categoryData[0].value, budget.currency) : '$0'}
                  )
                </p>
              </div>

              <div className="p-3.5 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A]">
                <span className="text-[#9E9E9E] text-[10px] uppercase tracking-widest block mb-1">
                  Budget Allocation Status
                </span>
                <p className="text-sm font-bold">
                  {budget.monthlyTotalLimit > 0 ? (
                    analytics.totalExpense <= budget.monthlyTotalLimit ? (
                      <span className="text-[#03DAC6]">
                        Within Limit ({((analytics.totalExpense / budget.monthlyTotalLimit) * 100).toFixed(0)}% used)
                      </span>
                    ) : (
                      <span className="text-[#CF6679]">
                        Exceeded by{' '}
                        {formatCurrency(analytics.totalExpense - budget.monthlyTotalLimit, budget.currency)}
                      </span>
                    )
                  ) : (
                    <span className="text-[#9E9E9E] font-normal">
                      No Target Set
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
