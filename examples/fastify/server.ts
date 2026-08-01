import Fastify from 'fastify';
import { MpesaStk, ValidationError, ApiError } from 'mpesa-stk';

const fastify = Fastify({ logger: true });

const mpesa = new MpesaStk({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortCode: process.env.MPESA_SHORTCODE!,
  callbackUrl: 'https://your-domain.com/api/v1/mpesa/callback',
  environment: 'sandbox',
});

// Register Event Handlers
mpesa.events.on('success', ({ payment, callback }) => {
  fastify.log.info({ payment, callback }, 'M-Pesa payment successful');
});

mpesa.events.on('failed', ({ payment, callback }) => {
  fastify.log.warn({ payment, callback }, 'M-Pesa payment failed');
});

// Initiate STK Push Route
fastify.post('/api/pay', async (request, reply) => {
  try {
    const { phone, amount, reference, description } = request.body as {
      phone: string;
      amount: number;
      reference: string;
      description?: string;
    };

    const result = await mpesa.initiate({
      phoneNumber: phone,
      amount,
      accountReference: reference,
      transactionDesc: description || 'Payment',
    });

    return reply.status(200).send({ success: true, data: result });
  } catch (error) {
    if (error instanceof ValidationError) {
      return reply.status(400).send({ success: false, error: error.message, field: error.field });
    }
    if (error instanceof ApiError) {
      return reply.status(error.statusCode || 500).send({ success: false, error: error.message });
    }
    return reply.status(500).send({ success: false, error: 'Internal Server Error' });
  }
});

// Webhook Callback Route
fastify.post('/api/v1/mpesa/callback', async (request, reply) => {
  try {
    await mpesa.handleCallback(request.body as any);
    return reply.status(200).send({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error: any) {
    fastify.log.error(error, 'Error processing M-Pesa callback');
    return reply.status(200).send({ ResultCode: 1, ResultDesc: error.message });
  }
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Fastify server listening on port 3000');
});