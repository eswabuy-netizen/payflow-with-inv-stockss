import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExpenseList } from '../components/expenses/ExpenseList';

export const Expenses: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#181f2a] p-6">
      <ExpenseList userRole={userProfile?.role as 'admin' | 'seller'} />
    </div>
  );
};
