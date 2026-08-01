import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { MpesaStk } from 'mpesa-stk';

const app = new Koa();
const router = new Router();

app.use(bodyParser());

const mpesa = new MpesaStk({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortCode: process.env.MPESA_SHORTCODE!,
  callbackUrl: 'https://your-domain.com/mpesa/callback',
  environment: 'sandbox',
});

router.post('/pay', async (ctx) => {
  const { phone, amount, reference } = ctx.request.body as any;
  try {
    const result = await mpesa.initiate({
      phoneNumber: phone,
      amount: Number(amount),
      accountReference: reference,
      transactionDesc: 'Koa Payment',
    });
    ctx.body = { success: true, data: result };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { success: false, error: err.message };
  }
});

router.post('/mpesa/callback', async (ctx) => {
  try {
    await mpesa.handleCallback(ctx.request.body as any);
    ctx.body = { ResultCode: 0, ResultDesc: 'Accepted' };
  } catch (err: any) {
    ctx.body = { ResultCode: 1, ResultDesc: err.message };
  }
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => console.log('Koa server listening on port 3000'));