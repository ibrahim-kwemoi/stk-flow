import { MpesaStk } from 'mpesa-stk';

export const mpesa = new MpesaStk({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortCode: process.env.MPESA_SHORTCODE!,
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
  environment: (process.env.MPESA_ENV as 'sandbox' | 'production') || 'sandbox',
});

mpesa.events.on('success', async ({ payment, callback }) => {
  console.log(`[PAYMENT SUCCESS] Receipt: ${callback.mpesaReceiptNumber}, Amount: ${payment.amount}`);
});

mpesa.events.on('failed', async ({ payment, callback }) => {
  console.log(`[PAYMENT FAILED] Ref: ${payment.accountReference}, Reason: ${callback.resultDesc}`);
});