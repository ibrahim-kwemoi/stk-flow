export type TransactionType = 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'CANCELLED';

export interface PaymentRecord {
  id: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  accountReference: string;
  transactionDesc: string;
  phoneNumber: string;
  amount: number;
  status: PaymentStatus;
  resultCode?: number;
  resultDesc?: string;
  mpesaReceiptNumber?: string;
  transactionDate?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}