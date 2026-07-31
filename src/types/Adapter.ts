import { PaymentRecord, PaymentStatus } from './Payment.js';

export interface StorageAdapter {
  save(record: Omit<PaymentRecord, 'createdAt' | 'updatedAt'>): Promise<PaymentRecord>;
  findByCheckoutRequestId(checkoutRequestId: string): Promise<PaymentRecord | null>;
  updateStatus(
    checkoutRequestId: string,
    status: PaymentStatus,
    details?: Partial<Pick<PaymentRecord, 'resultCode' | 'resultDesc' | 'mpesaReceiptNumber' | 'transactionDate'>>
  ): Promise<PaymentRecord>;
}