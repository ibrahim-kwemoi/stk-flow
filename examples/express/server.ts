import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MpesaStk } from 'mpesa-stk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

const mpesa = new MpesaStk({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortCode: process.env.MPESA_SHORTCODE!,
  callbackUrl: process.env.MPESA_CALLBACK_URL!,
  environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});

// Simple memory store to hold transaction state for client polling
const transactions = new Map<string, { status: 'PENDING' | 'SUCCESS' | 'FAILED'; message: string; receipt?: string }>();

/**
 * Initiate STK Push
 */
app.post('/api/v1/mpesa/stkpush', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, accountReference } = req.body;

    let formattedPhone = phoneNumber.trim().replace('+', '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    }

    const response = await mpesa.initiate({
      phoneNumber: formattedPhone,
      amount: Number(amount),
      accountReference: accountReference || 'Store Checkout',
      transactionDesc: 'Payment',
    });

    const checkoutRequestId = response.checkoutRequestId;
    transactions.set(checkoutRequestId, { status: 'PENDING', message: 'Waiting for PIN entry' });

    return res.status(200).json({
      success: true,
      checkoutRequestId,
      message: 'STK push sent. Enter PIN on your phone.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.errorMessage || error.message,
    });
  }
});

/**
 * Handle Async Callback from Safaricom
 */
app.post('/api/v1/mpesa/callback', (req: Request, res: Response) => {
  const callbackData = req.body.Body?.stkCallback;

  if (callbackData) {
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = callbackData;

    if (ResultCode === 0) {
      // Find M-Pesa receipt number from metadata items
      const receiptItem = CallbackMetadata?.Item?.find((i: any) => i.Name === 'MpesaReceiptNumber');
      transactions.set(CheckoutRequestID, {
        status: 'SUCCESS',
        message: 'Payment completed successfully!',
        receipt: receiptItem?.Value || 'N/A',
      });
    } else {
      transactions.set(CheckoutRequestID, {
        status: 'FAILED',
        message: ResultDesc || 'Payment was cancelled or failed.',
      });
    }
  }

  return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

/**
 * Client Polling Endpoint
 */
app.get('/api/v1/mpesa/query/:checkoutRequestId', (req: Request, res: Response) => {
  const { checkoutRequestId } = req.params;
  const transaction = transactions.get(checkoutRequestId);

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  return res.status(200).json({ success: true, ...transaction });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});