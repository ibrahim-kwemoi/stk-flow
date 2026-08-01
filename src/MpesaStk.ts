import { MemoryAdapter } from './adapters/MemoryAdapter.js';
import { DarajaClient } from './client/DarajaClient.js';
import { EventBus } from './events/EventBus.js';
import { Poller, PollingOptions } from './polling/Poller.js';
import { StorageAdapter } from './types/Adapter.js';
import { RawCallbackPayload } from './types/Callback.js';
import { InternalConfig, MpesaStkConfig } from './types/Config.js';
import { InitiatePaymentParams, InitiatePaymentResult } from './types/InitiatePayment.js';
import { PaymentRecord } from './types/Payment.js';
import { QueryPaymentResult } from './types/Query.js';
import { generateId } from './utils/uuid.js';
import { CallbackProcessor } from './webhooks/CallbackProcessor.js';

export class MpesaStk {
  private readonly config: InternalConfig;
  private readonly client: DarajaClient;
  private readonly adapter: StorageAdapter;
  private readonly callbackProcessor: CallbackProcessor;
  private readonly poller: Poller;
  public readonly events: EventBus;

  constructor(config: MpesaStkConfig) {
    this.adapter = config.adapter || new MemoryAdapter();
    const env = config.environment || 'sandbox';
    const baseUrl =
      env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    this.config = {
      ...config,
      environment: env,
      baseUrl,
      adapter: this.adapter,
      timeoutMs: config.timeoutMs || 60000,
    };

    this.client = new DarajaClient(this.config);
    this.events = new EventBus();
    this.callbackProcessor = new CallbackProcessor(this.adapter, this.events);
    this.poller = new Poller(this.client.stkQuery, this.adapter);
  }

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const result = await this.client.stkPush.initiate(params);

    await this.adapter.save({
      id: generateId(),
      merchantRequestId: result.merchantRequestId,
      checkoutRequestId: result.checkoutRequestId,
      accountReference: params.accountReference,
      transactionDesc: params.transactionDesc,
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      status: 'PENDING',
      metadata: params.metadata,
    });

    return result;
  }

  async handleCallback(payload: RawCallbackPayload) {
    return this.callbackProcessor.process(payload);
  }

  async query(checkoutRequestId: string): Promise<QueryPaymentResult> {
    return this.client.stkQuery.query(checkoutRequestId);
  }

  async waitForCompletion(checkoutRequestId: string, options?: PollingOptions): Promise<PaymentRecord> {
    return this.poller.poll(checkoutRequestId, options);
  }

  async getPayment(checkoutRequestId: string): Promise<PaymentRecord | null> {
    return this.adapter.findByCheckoutRequestId(checkoutRequestId);
  }
}