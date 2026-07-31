import { ApiError } from '../errors/ApiError.js';
import { NetworkError } from '../errors/NetworkError.js';
import { InternalConfig } from '../types/Config.js';
import { InitiatePaymentParams, InitiatePaymentResult, RawStkPushResponse } from '../types/InitiatePayment.js';

import { normalizePhone } from '../utils/normalizePhone.js';
import { generatePassword } from '../utils/password.js';
import { generateTimestamp } from '../utils/timestamp.js';
import { validateInitiateParams } from '../utils/validate.js';
import { OAuthManager } from './OAuth.js';

export class StkPushClient {
  constructor(
    private readonly config: InternalConfig,
    private readonly oauthManager: OAuthManager
  ) {}

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    validateInitiateParams(params);

    const token = await this.oauthManager.getAccessToken();
    const formattedPhone = normalizePhone(params.phoneNumber);
    const timestamp = generateTimestamp();
    const password = generatePassword(this.config.shortCode, this.config.passkey, timestamp);
    const url = `${this.config.baseUrl}/mpesa/stkpush/v1/processrequest`;

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: params.transactionType || 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: formattedPhone,
      PartyB: this.config.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: params.callbackUrl || this.config.callbackUrl,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as RawStkPushResponse;

      if (!response.ok || data.ResponseCode !== '0') {
        throw new ApiError(
          data.ResponseDescription || 'STK Push request failed',
          response.status,
          data.ResponseCode,
          data
        );
      }

      return {
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new NetworkError('Failed to send STK Push request', err as Error);
    }
  }
}