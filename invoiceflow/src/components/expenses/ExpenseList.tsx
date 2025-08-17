import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ExpenseForm } from './ExpenseForm';
import { Expense } from '../../types';
import { expenseService } from '../../lib/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ExpenseListProps {
  userRole?: 'admin' | 'seller';
}

const EXPENSE_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'travel', label: 'Travel & Transportation' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'utilities', label: 'Utilities & Services' },
  { value: 'rent', label: 'Rent & Leasing' },
  { value: 'equipment', label: 'Equipment & Tools' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'other', label: 'Other' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export const ExpenseList: React.FC<ExpenseListProps> = ({ userRole = 'admin' }) => {
  const { userProfile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (userProfile?.companyId) {
      fetchExpenses();
    }
  }, [userProfile?.companyId, userProfile?.role, userProfile?.uid]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const fetchExpenses = async () => {
    if (!userProfile?.companyId) return;
    
    try {
      setLoading(true);
      let expensesData: Expense[];
      
      if (userProfile.role === 'admin') {
        expensesData = await expenseService.getExpenses(userProfile.companyId);
      } else {
        expensesData = await expenseService.getExpensesByUser(userProfile.companyId, userProfile.uid);
      }

      // Ensure all dates are properly converted to Date objects
      const processedExpenses = expensesData.map(expense => ({
        ...expense,
        date: expense.date instanceof Date ? expense.date : new Date(expense.date),
        createdAt: expense.createdAt instanceof Date ? expense.createdAt : new Date(expense.createdAt),
        updatedAt: expense.updatedAt instanceof Date ? expense.updatedAt : new Date(expense.updatedAt),
        approvedAt: expense.approvedAt ? (expense.approvedAt instanceof Date ? expense.approvedAt : new Date(expense.approvedAt)) : undefined
      }));

      setExpenses(processedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortExpenses = () => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!userProfile?.uid) return;
    
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId, userProfile.uid);
        await fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleApprove = async (expenseId: string, status: 'approved' | 'rejected') => {
    if (!userProfile?.uid) return;
    
    try {
      await expenseService.approveExpense(expenseId, userProfile.uid, status);
      await fetchExpenses();
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  const handleSave = () => {
    fetchExpenses();
    setEditingExpense(undefined);
  };

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" icon={Clock}>Pending</Badge>;
      case 'approved':
        return <Badge variant="success" icon={CheckCircle}>Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger" icon={XCircle}>Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: Expense['category']) => {
    const colors: Record<string, string> = {
      office: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      travel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      marketing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      rent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      equipment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      software: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors.other;
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
            {userRole === 'admin' ? 'Expense Management' : 'My Expenses'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage business expenses
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              startIcon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'title')}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order
            </label>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card className="p-8 text-center">
            <ReceiptIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No expenses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || categoryFilter || statusFilter 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first expense.'
              }
            </p>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {expense.title}
                      </h3>
                      {getStatusBadge(expense.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Amount:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(expense.amount)}
                        </span>
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Date:</span>
                        {formatDate(expense.date)}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Category:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label}
                        </span>
                      </span>
                      
                      {expense.vendor && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Vendor:</span>
                          {expense.vendor}
                        </span>
                      )}
                    </div>
                    
                    {expense.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {expense.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {formatDate(expense.createdAt)}</span>
                      {expense.approvedAt && (
                        <span>• Approved: {formatDate(expense.approvedAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {expense.receipt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(expense.receipt, '_blank')}
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                      title="Edit Expense"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {userProfile?.role === 'admin' && expense.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(expense.id, 'approved')}
                          title="Approve Expense"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(expense.id, 'rejected')}
                          title="Reject Expense"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete Expense"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredExpenses.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Total: {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </div>
          </div>
        </Card>
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingExpense(undefined);
        }}
        expense={editingExpense}
        onSave={handleSave}
      />
    </div>
  );
};
