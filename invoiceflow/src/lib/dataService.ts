import { databaseService } from './database';
import { User, Company, Client, Invoice, Receipt, Quotation, UserManagement, Admin, Expense, ProfitLossReport } from '../types';

// User operations
export const userService = {
  async getCurrentUser(uid: string): Promise<User | null> {
    return await databaseService.get<User>('users', uid);
  },

  async getUserByUid(uid: string): Promise<User | null> {
    return await databaseService.get<User>('users', uid);
  },

  async updateUser(uid: string, data: Partial<User>, userId: string): Promise<void> {
    await databaseService.update<User>('users', uid, data, userId);
  },

  // New functions for user management
  async getCompanyUsers(companyId: string): Promise<UserManagement[]> {
    return await databaseService.getAll<UserManagement>('users', companyId);
  },

  async createUser(data: Omit<UserManagement, 'id'>, adminId: string): Promise<string> {
    return await databaseService.add<UserManagement>('users', data, adminId);
  },

  async updateUserStatus(userId: string, isActive: boolean, adminId: string): Promise<void> {
    await databaseService.update<UserManagement>('users', userId, { isActive, updatedAt: new Date() }, adminId);
  },

  async deleteUser(userId: string, adminId: string): Promise<void> {
    await databaseService.delete('users', userId, adminId);
  }
};

// Admin operations
export const adminService = {
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const admins = await databaseService.getAll<Admin>('admins');
      return admins.some(admin => admin.email.toLowerCase() === email.toLowerCase() && admin.isActive);
    } catch (error) {
      console.error('Error checking admin email:', error);
      return false;
    }
  },

  async createAdmin(data: Omit<Admin, 'id'>, createdBy: string): Promise<string> {
    return await databaseService.add<Admin>('admins', data, createdBy);
  },

  async updateAdmin(adminId: string, data: Partial<Admin>, updatedBy: string): Promise<void> {
    await databaseService.update<Admin>('admins', adminId, data, updatedBy);
  },

  async deleteAdmin(adminId: string, deletedBy: string): Promise<void> {
    await databaseService.delete('admins', adminId, deletedBy);
  },

  async getAllAdmins(): Promise<Admin[]> {
    return await databaseService.getAll<Admin>('admins');
  },

  // Force database upgrade to fix schema issues
  async forceDatabaseUpgrade(): Promise<void> {
    return await databaseService.forceUpgrade();
  }
};

// Company operations
export const companyService = {
  async getCompany(id: string): Promise<Company | null> {
    return await databaseService.get<Company>('companies', id);
  },

  async updateCompany(id: string, data: Partial<Company>, userId: string): Promise<void> {
    await databaseService.update<Company>('companies', id, data, userId);
  },

  async createCompany(data: Omit<Company, 'id'>, userId: string): Promise<string> {
    return await databaseService.add<Company>('companies', data, userId);
  }
};

// Client operations
export const clientService = {
  async getClients(companyId: string): Promise<Client[]> {
    return await databaseService.getAll<Client>('clients', companyId);
  },

  async getClient(id: string): Promise<Client | null> {
    return await databaseService.get<Client>('clients', id);
  },

  async createClient(data: Omit<Client, 'id'>, userId: string): Promise<string> {
    return await databaseService.add<Client>('clients', data, userId);
  },

  async updateClient(id: string, data: Partial<Client>, userId: string): Promise<void> {
    await databaseService.update<Client>('clients', id, data, userId);
  },

  async deleteClient(id: string, userId: string): Promise<void> {
    await databaseService.delete('clients', id, userId);
  },

  subscribeToClients(companyId: string, callback: (clients: Client[]) => void): () => void {
    return databaseService.subscribeToCollection<Client>('clients', callback, companyId);
  }
};

// Invoice operations
export const invoiceService = {
  async getInvoices(companyId: string): Promise<Invoice[]> {
    return await databaseService.getAll<Invoice>('invoices', companyId);
  },

  async getInvoicesBySeller(companyId: string, sellerId: string): Promise<Invoice[]> {
    const allInvoices = await databaseService.getAll<Invoice>('invoices', companyId);
    return allInvoices.filter(invoice => invoice.createdBy === sellerId);
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    return await databaseService.get<Invoice>('invoices', id);
  },

  async createInvoice(data: Omit<Invoice, 'id'>, userId: string): Promise<string> {
    return await databaseService.add<Invoice>('invoices', data, userId);
  },

  async updateInvoice(id: string, data: Partial<Invoice>, userId: string): Promise<void> {
    await databaseService.update<Invoice>('invoices', id, data, userId);
  },

  async deleteInvoice(id: string, userId: string): Promise<void> {
    await databaseService.delete('invoices', id, userId);
  },

  subscribeToInvoices(companyId: string, callback: (invoices: Invoice[]) => void): () => void {
    return databaseService.subscribeToCollection<Invoice>('invoices', callback, companyId);
  }
};

// Receipt operations
export const receiptService = {
  async getReceipts(companyId: string): Promise<Receipt[]> {
    return await databaseService.getAll<Receipt>('receipts', companyId);
  },

  async getReceiptsBySeller(companyId: string, sellerId: string): Promise<Receipt[]> {
    const allReceipts = await databaseService.getAll<Receipt>('receipts', companyId);
    return allReceipts.filter(receipt => receipt.createdBy === sellerId);
  },

  async getReceipt(id: string): Promise<Receipt | null> {
    return await databaseService.get<Receipt>('receipts', id);
  },

  async createReceipt(data: Omit<Receipt, 'id'>, userId: string): Promise<string> {
    return await databaseService.add<Receipt>('receipts', data, userId);
  },

  async updateReceipt(id: string, data: Partial<Receipt>, userId: string): Promise<void> {
    await databaseService.update<Receipt>('receipts', id, data, userId);
  },

  async deleteReceipt(id: string, userId: string): Promise<void> {
    await databaseService.delete('receipts', id, userId);
  },

  subscribeToReceipts(companyId: string, callback: (receipts: Receipt[]) => void): () => void {
    return databaseService.subscribeToCollection<Receipt>('receipts', callback, companyId);
  }
};

// Quotation operations
export const quotationService = {
  async getQuotations(companyId: string): Promise<Quotation[]> {
    return await databaseService.getAll<Quotation>('quotations', companyId);
  },

  async getQuotationsBySeller(companyId: string, sellerId: string): Promise<Quotation[]> {
    const allQuotations = await databaseService.getAll<Quotation>('quotations', companyId);
    return allQuotations.filter(quotation => quotation.createdBy === sellerId);
  },

  async getQuotation(id: string): Promise<Quotation | null> {
    return await databaseService.get<Quotation>('quotations', id);
  },

  async createQuotation(data: Omit<Quotation, 'id'>, userId: string): Promise<string> {
    return await databaseService.add<Quotation>('quotations', data, userId);
  },

  async updateQuotation(id: string, data: Partial<Quotation>, userId: string): Promise<void> {
    await databaseService.update<Quotation>('quotations', id, data, userId);
  },

  async deleteQuotation(id: string, userId: string): Promise<void> {
    await databaseService.delete('quotations', id, userId);
  },

  subscribeToQuotations(companyId: string, callback: (quotations: Quotation[]) => void): () => void {
    return databaseService.subscribeToCollection<Quotation>('quotations', callback, companyId);
  }
};

// Expense operations
export const expenseService = {
  async getExpenses(companyId: string): Promise<Expense[]> {
    return await databaseService.getAll<Expense>('expenses', companyId);
  },

  async getExpensesByUser(companyId: string, userId: string): Promise<Expense[]> {
    const allExpenses = await databaseService.getAll<Expense>('expenses', companyId);
    return allExpenses.filter(expense => expense.createdBy === userId);
  },

  async getExpense(id: string): Promise<Expense | null> {
    return await databaseService.get<Expense>('expenses', id);
  },

  async createExpense(data: Omit<Expense, 'id'>, userId: string): Promise<string> {
    return await databaseService.add<Expense>('expenses', data, userId);
  },

  async updateExpense(id: string, data: Partial<Expense>, userId: string): Promise<void> {
    await databaseService.update<Expense>('expenses', id, data, userId);
  },

  async deleteExpense(id: string, userId: string): Promise<void> {
    await databaseService.delete('expenses', id, userId);
  },

  async approveExpense(id: string, approvedBy: string, status: 'approved' | 'rejected'): Promise<void> {
    const updateData: Partial<Expense> = {
      status,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date()
    };
    await databaseService.update<Expense>('expenses', id, updateData, approvedBy);
  },

  subscribeToExpenses(companyId: string, callback: (expenses: Expense[]) => void): () => void {
    return databaseService.subscribeToCollection<Expense>('expenses', callback, companyId);
  }
};

// Profit & Loss Report operations
export const profitLossService = {
  async generateProfitLossReport(
    companyId: string,
    period: 'month' | 'quarter' | 'year',
    startDate: Date,
    endDate: Date
  ): Promise<ProfitLossReport> {
    // Get all invoices and expenses for the period
    const invoices = await invoiceService.getInvoices(companyId);
    const expenses = await expenseService.getExpenses(companyId);
    const receipts = await receiptService.getReceipts(companyId);

    // Filter data by date range
    const periodInvoices = invoices.filter(inv => 
      inv.issueDate >= startDate && inv.issueDate <= endDate
    );
    const periodExpenses = expenses.filter(exp => 
      exp.date >= startDate && exp.date <= endDate && exp.status === 'approved'
    );
    const periodReceipts = receipts.filter(rec => 
      rec.date >= startDate && rec.date <= endDate
    );

    // Calculate revenue
    const totalRevenue = periodInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const actualRevenue = periodReceipts.reduce((sum, rec) => sum + rec.amount, 0);

    // Calculate expenses
    const totalExpenses = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesByCategory = periodExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate profit
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = actualRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Calculate trends (simplified - you might want to compare with previous period)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    if (period === 'month') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      previousEndDate.setMonth(previousEndDate.getMonth() - 1);
    } else if (period === 'quarter') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 3);
      previousEndDate.setMonth(previousEndDate.getMonth() - 3);
    } else if (period === 'year') {
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
    }

    const previousInvoices = invoices.filter(inv => 
      inv.issueDate >= previousStartDate && inv.issueDate <= previousEndDate
    );
    const previousExpenses = expenses.filter(exp => 
      exp.date >= previousStartDate && exp.date <= previousEndDate && exp.status === 'approved'
    );
    const previousReceipts = receipts.filter(rec => 
      rec.date >= previousStartDate && rec.date <= previousEndDate
    );

    const previousRevenue = previousInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const previousExpensesTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousProfit = previousRevenue - previousExpensesTotal;

    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const expenseChange = previousExpensesTotal > 0 ? ((totalExpenses - previousExpensesTotal) / previousExpensesTotal) * 100 : 0;
    const profitChange = previousProfit !== 0 ? ((grossProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;

    return {
      period,
      startDate,
      endDate,
      revenue: {
        total: totalRevenue,
        invoices: periodInvoices.length,
        receipts: periodReceipts.length
      },
      expenses: {
        total: totalExpenses,
        byCategory: expensesByCategory,
        count: periodExpenses.length
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: profitMargin
      },
      trends: {
        revenueChange,
        expenseChange,
        profitChange
      }
    };
  }
};

// Utility functions
export const dataService = {
  isOnline() {
    return databaseService.isOnlineMode();
  },
  
  async syncData() {
    await databaseService.syncData();
  },

  async clearLocalData() {
    await databaseService.clearLocalData();
  }
}; 