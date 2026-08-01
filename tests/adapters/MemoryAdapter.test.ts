import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../../src/adapters/MemoryAdapter.js';

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(() => {
    adapter = new MemoryAdapter();
  });

  it('should save and retrieve payment records', async () => {
    const record = await adapter.save({
      id: '1',
      merchantRequestId: 'MR-123',
      checkoutRequestId: 'CR-123',
      accountReference: 'REF1',
      transactionDesc: 'Test',
      phoneNumber: '254712345678',
      amount: 100,
      status: 'PENDING',
    });

    expect(record.createdAt).toBeInstanceOf(Date);

    const retrieved = await adapter.findByCheckoutRequestId('CR-123');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.accountReference).toBe('REF1');
  });

  it('should update payment status', async () => {
    await adapter.save({
      id: '1',
      merchantRequestId: 'MR-123',
      checkoutRequestId: 'CR-123',
      accountReference: 'REF1',
      transactionDesc: 'Test',
      phoneNumber: '254712345678',
      amount: 100,
      status: 'PENDING',
    });

    const updated = await adapter.updateStatus('CR-123', 'SUCCESS', {
      mpesaReceiptNumber: 'NLJ8123456',
      resultCode: 0,
      resultDesc: 'Success',
    });

    expect(updated.status).toBe('SUCCESS');
    expect(updated.mpesaReceiptNumber).toBe('NLJ8123456');
  });
});