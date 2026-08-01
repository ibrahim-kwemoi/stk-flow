import { describe, it, expect, vi } from 'vitest';
import { Poller } from '../../src/polling/Poller.js';
import { MemoryAdapter } from '../../src/adapters/MemoryAdapter.js';
import { StkQueryClient } from '../../src/client/StkQuery.js';

describe('Poller', () => {
  it('should resolve immediately if adapter record is already completed', async () => {
    const adapter = new MemoryAdapter();
    const queryClient = {} as StkQueryClient;

    await adapter.save({
      id: '1',
      merchantRequestId: 'MR-100',
      checkoutRequestId: 'CR-100',
      accountReference: 'REF1',
      transactionDesc: 'Desc',
      phoneNumber: '254712345678',
      amount: 100,
      status: 'PENDING',
    });

    // Simulate callback updating state ahead of poller
    await adapter.updateStatus('CR-100', 'SUCCESS');

    const poller = new Poller(queryClient, adapter);
    const result = await poller.poll('CR-100', { intervalMs: 10, timeoutMs: 100 });

    expect(result.status).toBe('SUCCESS');
  });
});