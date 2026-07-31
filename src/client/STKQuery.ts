import { ApiError } from '../errors/ApiError.js';
import { NetworkError } from '../errors/NetworkError.js';
import { InternalConfig } from '../types/Config.js';
import { QueryPaymentResult, RawStkQueryResponse } from '../types/Query.js';
import { generatePassword } from '../utils/password.js';
import { generateTimestamp } from '../utils/timestamp.js';
import { OAuthManager } from './OAuth.js';

export class StkQueryClient {
  constructor(
    private readonly config: InternalConfig,
    private readonly oauthManager: OAuthManager
  ) {}

  async query(checkoutRequestId: string): Promise<QueryPaymentResult> {
    const token = await this.oauthManager.getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(this.config.shortCode, this.config.passkey, timestamp);
    const url = `${this.config.baseUrl}/mpesa/stkpushquery/v1/query`;

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
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

      const data = (await response.json()) as RawStkQueryResponse;

      if (!response.ok) {
        throw new ApiError(
          data.ResultDesc || data.ResponseDescription || 'STK Query request failed',
          response.status,
          data.ResponseCode,
          data
        );
      }

      let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';
      if (data.ResultCode === '0') {
        status = 'SUCCESS';
      } else if (data.ResultCode && data.ResultCode !== '0') {
        status = 'FAILED';
      }

      return {
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        resultCode: parseInt(data.ResultCode || '-1', 10),
        resultDesc: data.ResultDesc,
        status,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new NetworkError('Failed to query STK status', err as Error);
    }
  }
}