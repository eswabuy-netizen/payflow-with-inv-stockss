import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';

export const productService = {
  // Add new product
  async addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, companyId: string) {
    const product = {
      ...productData,
      companyId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'products'), product);
    return docRef.id;
  },

  // Update product
  async updateProduct(id: string, productData: Partial<Product>) {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: Timestamp.now()
    });
  },

  // Delete product
  async deleteProduct(id: string) {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  },

  // Get all products for a company
  async getProducts(companyId: string): Promise<Product[]> {
    const q = query(
      collection(db, 'products'), 
      where('companyId', '==', companyId),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Product));
  },

  // Search products for a company
  async searchProducts(searchTerm: string, companyId: string): Promise<Product[]> {
    const products = await this.getProducts(companyId);
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  },

  // Find product by barcode for a company
  async findProductByBarcode(barcode: string, companyId: string): Promise<Product | null> {
    const products = await this.getProducts(companyId);
    return products.find(product => 
      product.barcode && product.barcode.toLowerCase() === barcode.toLowerCase()
    ) || null;
  },

  // Get products by category for a company
  async getProductsByCategory(category: string, companyId: string): Promise<Product[]> {
    const q = query(
      collection(db, 'products'), 
      where('companyId', '==', companyId),
      where('category', '==', category),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Product));
  },

  // Real-time products listener for a company
  subscribeToProducts(callback: (products: Product[]) => void, companyId: string) {
    const q = query(
      collection(db, 'products'), 
      where('companyId', '==', companyId),
      orderBy('name')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      } as Product));
      
      callback(products);
    });
  },

  // Update stock quantity
  async updateStock(productId: string, newQuantity: number) {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      quantity: newQuantity,
      updatedAt: Timestamp.now()
    });
  }
};