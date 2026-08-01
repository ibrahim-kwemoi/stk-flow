import { describe, it, expect, vi } from 'vitest';
import { CallbackProcessor } from '../../src/webhooks/CallbackProcessor.js';
import { MemoryAdapter } from '../../src/adapters/MemoryAdapter.js';
import { EventBus } from '../../src/events/EventBus.js';

describe('CallbackProcessor', () => {
  it('should parse success callback metadata and emit success event', async () => {
    const adapter = new MemoryAdapter();
    const eventBus = new EventBus();

    await adapter.save({
      id: '1',
      merchantRequestId: 'MR-100',
      checkoutRequestId: 'CR-100',
      accountReference: 'REF1',
      transactionDesc: 'Desc',
      phoneNumber: '254712345678',
      amount: 250,
      status: 'PENDING',
    });

    const successSpy = vi.fn();
    eventBus.on('success', successSpy);

    const processor = new CallbackProcessor(adapter, eventBus);
    const result = await processor.process({
      Body: {
        stkCallback: {
          MerchantRequestID: 'MR-100',
          CheckoutRequestID: 'CR-100',
          ResultCode: 0,
          ResultDesc: 'Success',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 250 },
              { Name: 'MpesaReceiptNumber', Value: 'NLJ8123456' },
              { Name: 'TransactionDate', Value: 20260801123000 },
              { Name: 'PhoneNumber', Value: 254712345678 },
            ],
          },
        },
      },
    });

    expect(result.payment.status).toBe('SUCCESS');
    expect(result.parsed.mpesaReceiptNumber).toBe('NLJ8123456');
    expect(successSpy).toHaveBeenCalledTimes(1);
  });
});