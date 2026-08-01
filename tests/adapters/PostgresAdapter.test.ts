import { describe, it, expect, vi } from 'vitest';
import { PostgresAdapter, PgPoolLike } from '../../src/adapters/PostgresAdapter.js';

describe('PostgresAdapter', () => {
  it('should construct SQL query and save payment record', async () => {
    const mockPool: PgPoolLike = {
      query: vi.fn().mockResolvedValue({ rows: [{ id: 'id-1' }] }),
    };

    const adapter = new PostgresAdapter(mockPool);
    await adapter.save({
      id: 'id-1',
      merchantRequestId: 'MR-100',
      checkoutRequestId: 'CR-100',
      accountReference: 'REF1',
      transactionDesc: 'Desc',
      phoneNumber: '254712345678',
      amount: 200,
      status: 'PENDING',
    });

    expect(mockPool.query).toHaveBeenCalledTimes(1);
    expect((mockPool.query as any).mock.calls[0][0]).toContain('INSERT INTO mpesa_payments');
  });
});