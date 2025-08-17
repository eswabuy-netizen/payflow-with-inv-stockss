import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Receipt as ReceiptIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Expense } from '../../types';
import { expenseService } from '../../lib/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../lib/utils';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense;
  onSave: () => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'office', label: 'Office Supplies' },
  { value: 'travel', label: 'Travel & Transportation' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'utilities', label: 'Utilities & Services' },
  { value: 'rent', label: 'Rent & Leasing' },
  { value: 'equipment', label: 'Equipment & Tools' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'other', label: 'Other' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' }
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  expense,
  onSave
}) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'office' as Expense['category'],
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    paymentMethod: 'card' as Expense['paymentMethod'],
    receipt: '',
    status: 'pending' as Expense['status']
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description || '',
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date instanceof Date ? expense.date.toISOString().split('T')[0] : new Date(expense.date).toISOString().split('T')[0],
        vendor: expense.vendor || '',
        paymentMethod: expense.paymentMethod,
        receipt: expense.receipt || '',
        status: expense.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'office',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        paymentMethod: 'card',
        receipt: '',
        status: 'pending'
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userProfile?.companyId) return;

    setLoading(true);
    try {
      const expenseData = {
        companyId: userProfile.companyId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: new Date(formData.date),
        vendor: formData.vendor.trim() || undefined,
        paymentMethod: formData.paymentMethod,
        receipt: formData.receipt || undefined,
        status: formData.status,
        createdAt: expense ? expense.createdAt : new Date(),
        updatedAt: new Date(),
        createdBy: expense ? expense.createdBy : userProfile.uid
      };

      if (expense) {
        await expenseService.updateExpense(expense.id, expenseData, userProfile.uid);
      } else {
        await expenseService.createExpense(expenseData, userProfile.uid);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrors({ submit: 'Failed to save expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Office supplies purchase"
                error={errors.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                error={errors.amount}
                startIcon={<span className="text-gray-500">$</span>}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={errors.category}
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
                Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                error={errors.date}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendor
              </label>
              <Input
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="e.g., Office Depot"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this expense..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt URL
            </label>
            <div className="flex space-x-2">
              <Input
                value={formData.receipt}
                onChange={(e) => handleInputChange('receipt', e.target.value)}
                placeholder="https://example.com/receipt.pdf"
                startIcon={<ReceiptIcon className="w-4 h-4" />}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {userProfile?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          )}

          {errors.submit && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                expense ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
