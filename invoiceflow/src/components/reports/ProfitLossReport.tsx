import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  CreditCard,
  BarChart3,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProfitLossReport as ProfitLossReportType } from '../../types';
import { profitLossService } from '../../lib/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../lib/utils';

const PERIOD_OPTIONS = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const ProfitLossReportComponent: React.FC = () => {
  const { userProfile } = useAuth();
  const [report, setReport] = useState<ProfitLossReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (userProfile?.companyId) {
      generateReport();
    }
  }, [userProfile?.companyId, period]);

  const generateReport = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      
      let startDate: Date, endDate: Date;
      const now = new Date();

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }

      const reportData = await profitLossService.generateProfitLossReport(
        userProfile.companyId,
        period,
        startDate,
        endDate
      );

      setReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateReport = async () => {
    if (!userProfile?.companyId || !customStartDate || !customEndDate) return;

    try {
      setLoading(true);
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      const reportData = await profitLossService.generateProfitLossReport(
        userProfile.companyId,
        'month', // Default to month for custom dates
        startDate,
        endDate
      );

      setReport(reportData);
    } catch (error) {
      console.error('Error generating custom report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const prepareExpenseChartData = () => {
    if (!report) return [];
    
    return Object.entries(report.expenses.byCategory).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount
    }));
  };

  const exportReport = () => {
    if (!report) return;
    
    // Create CSV content
    const csvContent = [
      ['Profit & Loss Report'],
      [''],
      ['Period', `${report.period.charAt(0).toUpperCase() + report.period.slice(1)}`],
      ['Start Date', formatDate(report.startDate)],
      ['End Date', formatDate(report.endDate)],
      [''],
      ['Revenue'],
      ['Total Revenue', formatCurrency(report.revenue.total)],
      ['Invoices', report.revenue.invoices.toString()],
      ['Receipts', report.revenue.receipts.toString()],
      [''],
      ['Expenses'],
      ['Total Expenses', formatCurrency(report.expenses.total)],
      ['Expense Count', report.expenses.count.toString()],
      [''],
      ['Profit'],
      ['Gross Profit', formatCurrency(report.profit.gross)],
      ['Net Profit', formatCurrency(report.profit.net)],
      ['Profit Margin', `${report.profit.margin.toFixed(2)}%`],
      [''],
      ['Trends'],
      ['Revenue Change', `${report.trends.revenueChange.toFixed(2)}%`],
      ['Expense Change', `${report.trends.expenseChange.toFixed(2)}%`],
      ['Profit Change', `${report.trends.profitChange.toFixed(2)}%`]
    ].map(row => row.join(',')).join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-report-${report.period}-${formatDate(report.startDate)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profit & Loss Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your business performance and profitability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={exportReport}
            disabled={!report}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Period
            </label>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'month' | 'quarter' | 'year')}
            >
              {PERIOD_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Start Date
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom End Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button
                onClick={handleCustomDateReport}
                disabled={!customStartDate || !customEndDate}
                size="sm"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(report.revenue.total)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(report.trends.revenueChange)}
                    <span className={`text-sm font-medium ml-1 ${getTrendColor(report.trends.revenueChange)}`}>
                      {report.trends.revenueChange > 0 ? '+' : ''}{report.trends.revenueChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(report.expenses.total)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(report.trends.expenseChange)}
                    <span className={`text-sm font-medium ml-1 ${getTrendColor(report.trends.expenseChange)}`}>
                      {report.trends.expenseChange > 0 ? '+' : ''}{report.trends.expenseChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
                  <p className={`text-2xl font-bold ${report.profit.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(report.profit.net)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(report.trends.profitChange)}
                    <span className={`text-sm font-medium ml-1 ${getTrendColor(report.trends.profitChange)}`}>
                      {report.trends.profitChange > 0 ? '+' : ''}{report.trends.profitChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.profit.margin.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {report.revenue.total > 0 ? 'of revenue' : 'No revenue'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Expenses by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareExpenseChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Amount']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Revenue vs Expenses Pie Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue vs Expenses
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Revenue', value: report.revenue.total, color: '#10B981' },
                      { name: 'Expenses', value: report.expenses.total, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Revenue', value: report.revenue.total, color: '#10B981' },
                      { name: 'Expenses', value: report.expenses.total, color: '#EF4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Amount']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(report.revenue.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Invoices Generated</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {report.revenue.invoices}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Receipts Received</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {report.revenue.receipts}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Actual Revenue</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(report.revenue.receipts * (report.revenue.total / Math.max(report.revenue.invoices, 1)))}
                  </span>
                </div>
              </div>
            </Card>

            {/* Expense Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Expense Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(report.expenses.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Expense Count</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {report.expenses.count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Average per Expense</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(report.expenses.count > 0 ? report.expenses.total / report.expenses.count : 0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Category:</p>
                  {Object.entries(report.expenses.byCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {category}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Report Period Info */}
          <Card className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Report Period: {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </span>
              </div>
              <span>
                Generated on {formatDate(new Date())}
              </span>
            </div>
          </Card>
        </>
      )}

      {!report && (
        <Card className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Report Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a period to generate your profit and loss report.
          </p>
        </Card>
      )}
    </div>
  );
};
