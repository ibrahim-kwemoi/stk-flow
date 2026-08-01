import { StkQueryClient } from '../client/StkQuery.js';
import { TimeoutError } from '../errors/TimeoutError.js';
import { StorageAdapter } from '../types/Adapter.js';
import { PaymentRecord } from '../types/Payment.js';
import { sleep } from '../utils/sleep.js';

export interface PollingOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

export class Poller {
  constructor(
    private readonly queryClient: StkQueryClient,
    private readonly adapter: StorageAdapter
  ) {}

  async poll(checkoutRequestId: string, options: PollingOptions = {}): Promise<PaymentRecord> {
    const interval = options.intervalMs || 3000;
    const timeout = options.timeoutMs || 60000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const record = await this.adapter.findByCheckoutRequestId(checkoutRequestId);
      if (record && record.status !== 'PENDING') {
        return record;
      }

      try {
        const queryResult = await this.queryClient.query(checkoutRequestId);
        if (queryResult.status !== 'PENDING') {
          return await this.adapter.updateStatus(
            checkoutRequestId,
            queryResult.status,
            {
              resultCode: queryResult.resultCode,
              resultDesc: queryResult.resultDesc,
            }
          );
        }
      } catch (err) {
        // Continue polling until deadline if transient network error occurs
      }

      await sleep(interval);
    }

    await this.adapter.updateStatus(checkoutRequestId, 'TIMEOUT', {
      resultDesc: 'Polling deadline reached without terminal status',
    });

    throw new TimeoutError(`Payment polling timed out after ${timeout}ms for ${checkoutRequestId}`);
  }
}