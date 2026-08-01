import { StorageAdapter } from '../types/Adapter.js';
import { ParsedCallbackResult, RawCallbackPayload } from '../types/Callback.js';
import { PaymentRecord, PaymentStatus } from '../types/Payment.js';
import { parseCallbackTimestamp } from '../utils/timestamp.js';
import { EventBus } from '../events/EventBus.js';

export class CallbackProcessor {
  constructor(
    private readonly adapter: StorageAdapter,
    private readonly eventBus?: EventBus
  ) {}

  parsePayload(payload: RawCallbackPayload): ParsedCallbackResult {
    const callback = payload?.Body?.stkCallback;
    if (!callback) {
      throw new Error('Invalid callback structure: missing Body.stkCallback');
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;
    const items = CallbackMetadata?.Item || [];

    const getItem = (name: string) => items.find((i) => i.Name === name)?.Value;

    const amount = getItem('Amount') as number | undefined;
    const mpesaReceiptNumber = getItem('MpesaReceiptNumber') as string | undefined;
    const transactionDateRaw = getItem('TransactionDate');
    const phoneNumber = getItem('PhoneNumber') ? String(getItem('PhoneNumber')) : undefined;

    return {
      merchantRequestId: MerchantRequestID,
      checkoutRequestId: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      success: ResultCode === 0,
      amount,
      mpesaReceiptNumber,
      transactionDate: parseCallbackTimestamp(transactionDateRaw),
      phoneNumber,
    };
  }

  async process(payload: RawCallbackPayload): Promise<{ payment: PaymentRecord; parsed: ParsedCallbackResult }> {
    const parsed = this.parsePayload(payload);
    
    let status: PaymentStatus = 'FAILED';
    if (parsed.resultCode === 0) {
      status = 'SUCCESS';
    } else if (parsed.resultCode === 1032) {
      status = 'CANCELLED';
    } else if (parsed.resultCode === 1037) {
      status = 'TIMEOUT';
    }

    const updatedPayment = await this.adapter.updateStatus(parsed.checkoutRequestId, status, {
      resultCode: parsed.resultCode,
      resultDesc: parsed.resultDesc,
      mpesaReceiptNumber: parsed.mpesaReceiptNumber,
      transactionDate: parsed.transactionDate,
    });

    if (this.eventBus) {
      if (status === 'SUCCESS') {
        this.eventBus.emit('success', { payment: updatedPayment, callback: parsed });
      } else if (status === 'CANCELLED') {
        this.eventBus.emit('cancelled', { payment: updatedPayment, callback: parsed });
      } else {
        this.eventBus.emit('failed', { payment: updatedPayment, callback: parsed });
      }
    }

    return { payment: updatedPayment, parsed };
  }
}