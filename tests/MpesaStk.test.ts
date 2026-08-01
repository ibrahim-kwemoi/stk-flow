import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MpesaStk } from '../src/MpesaStk.js';

describe('MpesaStk Integration', () => {
  let mpesa: MpesaStk;

  beforeEach(() => {
    vi.restoreAllMocks();

    mpesa = new MpesaStk({
      consumerKey: 'test_key',
      consumerSecret: 'test_secret',
      passkey: 'test_passkey',
      shortCode: '174379',
      callbackUrl: 'https://example.com/callback',
      environment: 'sandbox',
    });
  });

  it('should trigger STK push and create a pending record', async () => {
    // Mock OAuth Token Response
    const mockTokenRes = new Response(
      JSON.stringify({ access_token: 'fake_access_token', expires_in: '3599' }),
      { status: 200 }
    );

    // Mock STK Push Response
    const mockStkRes = new Response(
      JSON.stringify({
        MerchantRequestID: '29182-1001-1',
        CheckoutRequestID: 'ws_CO_01012026_123456',
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: 'Success. Request accepted for processing',
      }),
      { status: 200 }
    );

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockTokenRes)
      .mockResolvedValueOnce(mockStkRes);

    const result = await mpesa.initiate({
      phoneNumber: '0712345678',
      amount: 100,
      accountReference: 'REF-001',
      transactionDesc: 'Test Order',
    });

    expect(result.checkoutRequestId).toBe('ws_CO_01012026_123456');

    const payment = await mpesa.getPayment('ws_CO_01012026_123456');
    expect(payment).not.toBeNull();
    expect(payment?.status).toBe('PENDING');
    expect(payment?.amount).toBe(100);
  });

  it('should process webhook callback and emit success event', async () => {
    // Seed pending transaction
    await (mpesa as any).adapter.save({
      id: '1',
      merchantRequestId: '29182-1001-1',
      checkoutRequestId: 'ws_CO_01012026_123456',
      accountReference: 'REF-001',
      transactionDesc: 'Test Order',
      phoneNumber: '254712345678',
      amount: 100,
      status: 'PENDING',
    });

    const successSpy = vi.fn();
    mpesa.events.on('success', successSpy);

    const callbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: '29182-1001-1',
          CheckoutRequestID: 'ws_CO_01012026_123456',
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 100 },
              { Name: 'MpesaReceiptNumber', Value: 'NLJ8123456' },
              { Name: 'TransactionDate', Value: 20260801123000 },
              { Name: 'PhoneNumber', Value: 254712345678 },
            ],
          },
        },
      },
    };

    const { payment } = await mpesa.handleCallback(callbackPayload);

    expect(payment.status).toBe('SUCCESS');
    expect(payment.mpesaReceiptNumber).toBe('NLJ8123456');
    expect(successSpy).toHaveBeenCalledTimes(1);
  });
});