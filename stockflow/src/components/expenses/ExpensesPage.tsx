import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Receipt, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { expensesService } from '../../services/expensesService';
import { Expense } from '../../types';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/currency';
import { Navigate } from 'react-router-dom';

const defaultForm = {
  amount: '',
  category: 'rent' as Expense['category'],
  description: '',
  date: ''
};

const ExpensesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const loadExpenses = async () => {
    if (!currentUser?.companyId) return;
    const now = new Date();
    let start: Date;
    switch (filter) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    const data = await expensesService.getExpenses(currentUser.companyId, start, now);
    setExpenses(data);
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.companyId, filter]);

  const total = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.companyId) return;
    try {
      setLoading(true);
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        showToast('Enter a valid amount', 'error');
        return;
      }
      const date = form.date ? new Date(form.date) : new Date();
      await expensesService.addExpense({
        companyId: currentUser.companyId,
        amount,
        category: form.category,
        description: form.description || undefined,
        date,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email || undefined
      });
      showToast('Expense recorded', 'success');
      setForm(defaultForm);
      await loadExpenses();
    } catch (err) {
      console.error(err);
      showToast('Failed to add expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    currentUser?.role === 'attendant' ? <Navigate to="/sales" replace /> :
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">Record and track business expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Receipt className="h-5 w-5 mr-2" /> New Expense</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Expense['category'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="rent">Rent</option>
              <option value="electricity">Electricity</option>
              <option value="salaries">Salaries</option>
              <option value="utilities">Utilities</option>
              <option value="maintenance">Maintenance</option>
              <option value="misc">Misc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional details"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Add Expense'}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Recent Expenses</div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{format(new Date(exp.date), 'yyyy-MM-dd')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">{exp.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{exp.description || '-'}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No expenses recorded</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white" colSpan={2}>Total</td>
                  <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">{formatCurrency(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;


