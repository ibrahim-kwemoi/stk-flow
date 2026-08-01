import { NextResponse } from 'next/server';
import { mpesa } from '@/lib/mpesa';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { payment, parsed } = await mpesa.handleCallback(payload);

    console.log(`Processed callback for Request ID: ${payment.checkoutRequestId}`);

    return NextResponse.json(
      { ResultCode: 0, ResultDesc: 'Callback processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling M-Pesa callback:', error);

    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'An error occurred processing the callback' },
      { status: 200 }
    );
  }
}