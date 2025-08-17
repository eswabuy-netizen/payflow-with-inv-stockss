import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Sale, SaleItem } from '../types';
import { productService } from './productService';

export const salesService = {
  // Process sale and update inventory
  async processSale(saleData: {
    items: SaleItem[];
    total: number;
    totalProfit: number;
    attendantId: string;
    attendantEmail: string;
    companyId: string;
  }) {
    // First, get current product quantities before starting batch
    const productUpdates = [];
    for (const item of saleData.items) {
      const productRef = doc(db, 'products', item.productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        const currentQuantity = productDoc.data().quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity); // Prevent negative quantities
        
        productUpdates.push({
          ref: productRef,
          newQuantity: newQuantity
        });
      }
    }
    
    // Now create the batch with all updates
    const batch = writeBatch(db);
    
    // Create sale record
    const saleRef = doc(collection(db, 'sales'));
    const sale = {
      ...saleData,
      createdAt: Timestamp.now()
    };
    batch.set(saleRef, sale);
    
    // Update product quantities
    for (const update of productUpdates) {
      batch.update(update.ref, {
        quantity: update.newQuantity,
        updatedAt: Timestamp.now()
      });
    }
    
    await batch.commit();
    return saleRef.id;
  },

  // Get sales history for a company
  async getSales(companyId: string, startDate?: Date, endDate?: Date): Promise<Sale[]> {
    let q = query(
      collection(db, 'sales'), 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    if (startDate && endDate) {
      q = query(
        collection(db, 'sales'),
        where('companyId', '==', companyId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Sale));
  },

  // Get sales by attendant for a company
  async getSalesByAttendant(attendantId: string, companyId: string): Promise<Sale[]> {
    const q = query(
      collection(db, 'sales'),
      where('companyId', '==', companyId),
      where('attendantId', '==', attendantId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Sale));
  },

  // Calculate sales analytics
  async getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly', companyId: string) {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    const sales = await this.getSales(companyId, startDate, now);
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;
    
    // Calculate total profit with fallback for missing totalProfit
    const totalProfit = sales.reduce((sum, sale) => {
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
    
    // Calculate top selling products
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number; profit: number } } = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
        // Calculate item profit with fallback
        const itemProfit = item.profit || ((item.price - (item.buyingPrice || 0)) * item.quantity);
        productSales[item.productId].profit += itemProfit;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    return {
      totalSales,
      totalTransactions,
      totalProfit,
      averageTransactionValue: totalTransactions > 0 ? totalSales / totalTransactions : 0,
      averageProfitPerTransaction: totalTransactions > 0 ? totalProfit / totalTransactions : 0,
      topProducts,
      salesData: sales
    };
  }
};