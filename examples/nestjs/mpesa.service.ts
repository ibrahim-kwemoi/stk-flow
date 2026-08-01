import { Injectable, OnModuleInit } from '@nestjs/common';
import { MpesaStk, InitiatePaymentParams, RawCallbackPayload } from 'mpesa-stk';

@Injectable()
export class MpesaService implements OnModuleInit {
  private mpesa: MpesaStk;

  constructor() {
    this.mpesa = new MpesaStk({
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      passkey: process.env.MPESA_PASSKEY!,
      shortCode: process.env.MPESA_SHORTCODE!,
      callbackUrl: `${process.env.APP_URL}/mpesa/callback`,
      environment: (process.env.MPESA_ENV as 'sandbox' | 'production') || 'sandbox',
    });
  }

  onModuleInit() {
    this.mpesa.events.on('success', ({ payment, callback }) => {
      console.log(`[NestJS] Payment successful: ${payment.checkoutRequestId}, Receipt: ${callback.mpesaReceiptNumber}`);
    });

    this.mpesa.events.on('failed', ({ payment, callback }) => {
      console.error(`[NestJS] Payment failed: ${payment.checkoutRequestId}, Reason: ${callback.resultDesc}`);
    });
  }

  async initiatePayment(params: InitiatePaymentParams) {
    return this.mpesa.initiate(params);
  }

  async processCallback(payload: RawCallbackPayload) {
    return this.mpesa.handleCallback(payload);
  }

  async queryStatus(checkoutRequestId: string) {
    return this.mpesa.query(checkoutRequestId);
  }
}