import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StkPushClient } from '../../src/client/StkPush.js';
import { OAuthManager } from '../../src/client/OAuth.js';
import { InternalConfig } from '../../src/types/Config.js';
import { MemoryAdapter } from '../../src/adapters/MemoryAdapter.js';

describe('StkPushClient', () => {
  const config: InternalConfig = {
    consumerKey: 'key',
    consumerSecret: 'secret',
    passkey: 'passkey',
    shortCode: '174379',
    callbackUrl: 'http://localhost/callback',
    environment: 'sandbox',
    baseUrl: 'https://sandbox.safaricom.co.ke',
    adapter: new MemoryAdapter(),
    timeoutMs: 60000,
  };

  let oauthManager: OAuthManager;

  beforeEach(() => {
    vi.restoreAllMocks();
    oauthManager = new OAuthManager(config);
    vi.spyOn(oauthManager, 'getAccessToken').mockResolvedValue('valid_access_token');
  });

  it('should send correct payload to Daraja STK Push endpoint', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          MerchantRequestID: 'MR-1',
          CheckoutRequestID: 'CR-1',
          ResponseCode: '0',
          ResponseDescription: 'Success',
          CustomerMessage: 'Success',
        }),
        { status: 200 }
      )
    );

    const stkPush = new StkPushClient(config, oauthManager);
    const result = await stkPush.initiate({
      phoneNumber: '0712345678',
      amount: 100,
      accountReference: 'REF1',
      transactionDesc: 'Order',
    });

    expect(result.checkoutRequestId).toBe('CR-1');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      expect.objectContaining({ method: 'POST' })
    );
  });
});