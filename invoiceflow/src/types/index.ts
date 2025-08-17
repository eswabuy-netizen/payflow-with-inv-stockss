export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'manager' | 'admin' | 'seller';
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean; // For admin to deactivate sellers
  addedBy?: string; // Track who added this user (for sellers)
  temporaryPassword?: string; // Temporary password set by admin
}

export interface Admin {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addedBy?: string; // Track who added this admin
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  digitalSignature?: string;
  digitalStamp?: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  vatRegistrationNumber?: string; // ESRA VAT compliance
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string; // Taxpayer ID (TIN) for SRA compliance
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  invoiceNumber: string;
  title: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Track which seller created this invoice
}

export interface Receipt {
  id: string;
  companyId: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'other';
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Track which seller created this receipt
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalClients: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  monthlyExpenses: Array<{ month: string; expenses: number }>;
  recentInvoices: Invoice[];
  recentExpenses: Expense[];
}

export interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';

export interface Quotation {
  companyId: string;
  id: string;
  clientId: string;
  clientName: string;
  items: QuotationItem[];
  subtotal: number; // ESRA VAT compliance
  tax: number; // ESRA VAT compliance
  total: number;
  status: QuotationStatus;
  date: string;
  expiryDate: string;
  notes?: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  amount: number;
  category: 'office' | 'travel' | 'marketing' | 'utilities' | 'rent' | 'equipment' | 'software' | 'other';
  date: Date;
  receipt?: string; // URL to receipt image/document
  vendor?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Track which user created this expense
  approvedBy?: string; // Track who approved/rejected the expense
  approvedAt?: Date;
}

export interface ProfitLossReport {
  period: 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  revenue: {
    total: number;
    invoices: number;
    receipts: number;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    count: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number; // percentage
  };
  trends: {
    revenueChange: number; // percentage change from previous period
    expenseChange: number; // percentage change from previous period
    profitChange: number; // percentage change from previous period
  };
}

export interface UserManagement {
  id: string;
  companyId: string;
  email: string;
  displayName: string;
  role: 'manager' | 'admin' | 'seller';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addedBy?: string;
  temporaryPassword?: string; // Temporary password set by admin
}