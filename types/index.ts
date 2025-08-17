export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
<<<<<<< HEAD
  phoneNumber: string;
=======
  businessName?: string;
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  type: 'topup' | 'payment' | 'invoice' | 'product';
  reference?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  metadata?: {
    invoiceId?: string;
    productId?: string;
    productCode?: string;
    receiverEmail?: string;
<<<<<<< HEAD
=======
    merchantName?: string;
    paymentMethod?: 'momo' | 'bank_transfer' | 'momo_send';
    phoneNumber?: string;
    momoReference?: string;
    referenceNumber?: string;
    depositRequestId?: string;
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
  };
}

export interface Invoice {
  id: string;
<<<<<<< HEAD
=======
  businessName: string;
  totalRevenue: number;
  totalInvoices: number;
  pendingAmount: number;
  totalClients: number;
  linkedSystems: {
    stockFlow?: boolean;
    invoiceFlow?: boolean;
  };
}

export interface Invoice {
  id: string;
  merchantId: string;
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
  clientEmail: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
  paidBy?: string;
}

export interface Product {
  id: string;
<<<<<<< HEAD
=======
  merchantId: string;
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
  name: string;
  price: number;
  quantity: number;
  sku: string;
  category: string;
  description?: string;
<<<<<<< HEAD
=======
}

export interface PaymentReference {
  id: string;
  referenceNumber: string;
  userId: string;
  amount: number;
  method: 'bank_transfer' | 'momo_send';
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface MoMoPaymentRequest {
  phoneNumber: string;
  amount: number;
  description: string;
  userId: string;
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
}