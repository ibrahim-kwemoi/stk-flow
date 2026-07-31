import { TransactionType } from './Payment.js';

export interface InitiatePaymentParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  transactionType?: TransactionType;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface RawStkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface InitiatePaymentResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}