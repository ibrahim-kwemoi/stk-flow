import express from 'express';
import { MpesaStk } from '../../src/index.js';

const app = express();
app.use(express.json());

const mpesa = new MpesaStk({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortCode: process.env.MPESA_SHORTCODE!,
  callbackUrl: 'https://your-domain.com/api/v1/mpesa/callback',
  environment: 'sandbox',
});

// Event listeners
mpesa.events.on('success', ({ payment, callback }) => {
  console.log(`Payment received for ${payment.accountReference}: KES ${payment.amount}`);
  console.log(`Receipt: ${callback.mpesaReceiptNumber}`);
});

mpesa.events.on('failed', ({ payment, callback }) => {
  console.log(`Payment failed: ${callback.resultDesc}`);
});

// Initiate STK Push Endpoint
app.post('/api/pay', async (req, res) => {
  try {
    const { phone, amount, reference } = req.body;
    const result = await mpesa.initiate({
      phoneNumber: phone,
      amount: Number(amount),
      accountReference: reference,
      transactionDesc: 'Order Payment',
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Callback Webhook Endpoint
app.post('/api/v1/mpesa/callback', async (req, res) => {
  try {
    await mpesa.handleCallback(req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error: any) {
    res.status(500).json({ ResultCode: 1, ResultDesc: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));