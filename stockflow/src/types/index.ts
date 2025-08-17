import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  role: 'manager' | 'admin' | 'attendant';
  displayName?: string;
  active: boolean;
  companyId: string; // Company identifier for data isolation
  isTemporaryPassword?: boolean;
  createdBy?: string;
  createdAt: Date | Timestamp;
  passwordUpdatedAt?: Date | Timestamp;
  deactivatedAt?: Date | Timestamp;
  reactivatedAt?: Date | Timestamp;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string; // Barcode for scanning
  category: string;
  price: number; // Selling price
  buyingPrice: number; // Cost price for profit calculation
  quantity: number;
  lowStockThreshold: number;
  companyId: string; // Company identifier for data isolation
  imageUrl?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Selling price
  buyingPrice: number; // Cost price
  total: number;
  profit: number; // Profit for this item
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  totalProfit: number; // Total profit for the sale
  companyId: string; // Company identifier for data isolation
  createdAt: Date | Timestamp;
  attendantId: string;
  attendantEmail: string;
}

export interface RestockEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  companyId: string; // Company identifier for data isolation
  createdAt: Date | Timestamp;
  userId: string;
  userEmail: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  totalSales: number;
  totalProfit: number; // Total profit from inventory
  totalSalesProfit: number; // Total profit from today's sales
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface Expense {
  id: string;
  companyId: string;
  amount: number;
  category: 'rent' | 'electricity' | 'salaries' | 'utilities' | 'maintenance' | 'misc';
  description?: string;
  date: Date | Timestamp; // The date the expense applies to
  createdAt: Date | Timestamp; // When the record was created
  createdBy?: string; // user id
  createdByEmail?: string; // user email
}