import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Receipt } from 'lucide-react';
import { salesService } from '../../services/salesService';
import { useAuth } from '../../contexts/AuthContext';
import { Sale } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

interface SalesHistoryProps {
  onClose: () => void;
}

// Normalize Firestore Timestamp | Date to Date
const ensureDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  // Firestore Timestamp has a toDate() method
  // Using optional chaining to avoid runtime errors if not present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeTimestamp = value as any;
  if (maybeTimestamp && typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate();
  }
  return new Date(value as string);
};

const SalesHistory: React.FC<SalesHistoryProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (currentUser?.companyId) {
      loadSales();
    }
  }, [currentUser?.companyId]);

  const loadSales = async () => {
    if (!currentUser?.companyId) return;
    
    try {
      const salesData = await salesService.getSales(currentUser.companyId);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-2xl lg:max-w-6xl my-2 sm:my-4 max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Sales History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-120px)] scrollbar-thin">
          {sales.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Receipt className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No sales found
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Sales will appear here once transactions are processed.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedSale(sale)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {format(ensureDate(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="truncate">{sale.attendantEmail}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(sale.total)}
                      </p>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                        Profit: {formatCurrency(sale.totalProfit)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {sale.items.length} item(s)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sale Details Modal */}
        {selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Sale Details
                </h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      {format(ensureDate(selectedSale.createdAt), 'MMMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Attendant</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {selectedSale.attendantEmail}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Items</p>
                    <div className="space-y-2">
                      {selectedSale.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Profit: {formatCurrency(item.profit)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base flex-shrink-0">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Total Profit</p>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(selectedSale.totalProfit)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(selectedSale.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;