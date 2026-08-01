import { NextResponse } from 'next/server';
import { mpesa } from '@/lib/mpesa';
import { ValidationError, ApiError } from 'mpesa-stk';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, amount, accountReference, transactionDesc } = body;

    const result = await mpesa.initiate({
      phoneNumber,
      amount: Number(amount),
      accountReference,
      transactionDesc: transactionDesc || 'Order Payment',
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          checkoutRequestId: result.checkoutRequestId,
          customerMessage: result.customerMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, field: error.field },
        { status: 400 }
      );
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.responseCode },
        { status: error.statusCode || 500 }
      );
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}