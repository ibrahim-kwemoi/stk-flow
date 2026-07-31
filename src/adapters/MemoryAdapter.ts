import { StorageAdapter } from '../types/Adapter.js';
import { PaymentRecord, PaymentStatus } from '../types/Payment.js';

export class MemoryAdapter implements StorageAdapter {
  private records = new Map<string, PaymentRecord>();

  async save(record: Omit<PaymentRecord, 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    const now = new Date();
    const fullRecord: PaymentRecord = {
      ...record,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.checkoutRequestId, fullRecord);
    return fullRecord;
  }

  async findByCheckoutRequestId(checkoutRequestId: string): Promise<PaymentRecord | null> {
    return this.records.get(checkoutRequestId) || null;
  }

  async updateStatus(
    checkoutRequestId: string,
    status: PaymentStatus,
    details?: Partial<Pick<PaymentRecord, 'resultCode' | 'resultDesc' | 'mpesaReceiptNumber' | 'transactionDate'>>
  ): Promise<PaymentRecord> {
    const record = this.records.get(checkoutRequestId);
    if (!record) {
      throw new Error(`Payment record not found for CheckoutRequestID: ${checkoutRequestId}`);
    }

    const updated: PaymentRecord = {
      ...record,
      status,
      ...details,
      updatedAt: new Date(),
    };

    this.records.set(checkoutRequestId, updated);
    return updated;
  }
}