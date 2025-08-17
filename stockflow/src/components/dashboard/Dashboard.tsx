import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingDown, ShoppingCart, Receipt } from 'lucide-react';
import { productService } from '../../services/productService';
import { salesService } from '../../services/salesService';
import { expensesService } from '../../services/expensesService';
import { Product, InventoryStats } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';
import LowStockAlert from './LowStockAlert';
import RecentActivity from './RecentActivity';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    totalSales: 0,
    totalProfit: 0,
    totalSalesProfit: 0
  });
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser?.companyId) return;
      
      try {
        // Load products
        const productsData = await productService.getProducts(currentUser.companyId);
        setProducts(productsData);

        // Calculate stats
        const totalProducts = productsData.length;
        const totalValue = productsData.reduce((sum, product) => 
          sum + (product.price * product.quantity), 0
        );
        const totalCost = productsData.reduce((sum, product) => 
          sum + ((product.buyingPrice ?? 0) * product.quantity), 0
        );
        const totalProfit = totalValue - totalCost;
        const lowStockCount = productsData.filter(product => 
          product.quantity <= product.lowStockThreshold
        ).length;

        // Get today's sales
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const sales = await salesService.getSales(currentUser.companyId, startOfDay, today);
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        
        // Calculate total profit from sales, handling cases where totalProfit might be undefined
        const totalSalesProfit = sales.reduce((sum, sale) => {
          // If totalProfit is not available, calculate it from the items
          if (sale.totalProfit !== undefined && sale.totalProfit !== null) {
            return sum + sale.totalProfit;
          } else {
            // Calculate profit from sale items
            const saleProfit = sale.items.reduce((itemSum, item) => {
              const itemProfit = item.profit || ((item.price - (item.buyingPrice || 0)) * item.quantity);
              return itemSum + itemProfit;
            }, 0);
            return sum + saleProfit;
          }
        }, 0);
        
        // Debug logging
        console.log('Sales data:', sales);
        console.log('Total sales profit calculated:', totalSalesProfit);

        // Ensure all values are valid numbers
        const safeTotalSalesProfit = isNaN(totalSalesProfit) ? 0 : totalSalesProfit;
        const safeTotalProfit = isNaN(totalProfit) ? 0 : totalProfit;
        const safeTotalValue = isNaN(totalValue) ? 0 : totalValue;
        
        // Load today's expenses
        const expensesTotal = await expensesService.getExpenseTotals(currentUser.companyId, startOfDay, today);
        setTodayExpenses(expensesTotal);

        setStats({
          totalProducts,
          totalValue: safeTotalValue,
          lowStockCount,
          totalSales,
          totalProfit: safeTotalProfit,
          totalSalesProfit: safeTotalSalesProfit
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser?.companyId]);

  const lowStockProducts = products.filter(product => 
    product.quantity <= product.lowStockThreshold
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prevent attendants from accessing the dashboard
  if (currentUser?.role === 'attendant') {
    return <Navigate to="/sales" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Welcome to your inventory management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockCount.toString()}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Today's Sales"
          value={formatCurrency(stats.totalSales)}
          icon={ShoppingCart}
          color="purple"
        />
        <StatsCard
          title="Today's Profit"
          value={formatCurrency(isNaN(stats.totalSalesProfit) ? 0 : stats.totalSalesProfit)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Today's Expenses"
          value={formatCurrency(todayExpenses)}
          icon={Receipt}
          color="red"
        />
        <StatsCard
          title="Net Profit (Today)"
          value={formatCurrency((isNaN(stats.totalSalesProfit) ? 0 : stats.totalSalesProfit) - (isNaN(todayExpenses) ? 0 : todayExpenses))}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <LowStockAlert products={lowStockProducts} />
      )}

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;