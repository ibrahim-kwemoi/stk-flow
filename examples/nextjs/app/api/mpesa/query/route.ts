import { NextResponse } from 'next/server';
import { mpesa } from '@/lib/mpesa';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checkoutRequestId = params.id;
    const payment = await mpesa.getPayment(checkoutRequestId);

    if (payment && payment.status !== 'PENDING') {
      return NextResponse.json({ success: true, data: payment });
    }

    const queryResult = await mpesa.query(checkoutRequestId);

    return NextResponse.json({
      success: true,
      data: {
        status: queryResult.status,
        resultDesc: queryResult.resultDesc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to query status';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}