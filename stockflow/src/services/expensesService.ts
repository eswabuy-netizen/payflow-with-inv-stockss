import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Expense } from '../types';

export const expensesService = {
  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
    const expenseWithTimestamps = {
      ...expense,
      createdAt: Timestamp.now(),
      // Ensure Firestore Timestamp for date
      date: expense.date instanceof Date ? Timestamp.fromDate(expense.date) : expense.date
    };
    const docRef = await addDoc(collection(db, 'expenses'), expenseWithTimestamps);
    return docRef.id;
  },

  async getExpenses(companyId: string, startDate?: Date, endDate?: Date): Promise<Expense[]> {
    let q = query(
      collection(db, 'expenses'),
      where('companyId', '==', companyId),
      orderBy('date', 'desc')
    );

    if (startDate && endDate) {
      q = query(
        collection(db, 'expenses'),
        where('companyId', '==', companyId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: d.data().date.toDate(),
      createdAt: d.data().createdAt.toDate()
    } as Expense));
  },

  async getExpenseTotals(companyId: string, startDate: Date, endDate: Date): Promise<number> {
    const expenses = await this.getExpenses(companyId, startDate, endDate);
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }
};


