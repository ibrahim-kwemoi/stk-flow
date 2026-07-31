export interface CallbackItem {
  Name: string;
  Value?: string | number;
}

export interface StkCallbackBody {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: CallbackItem[];
  };
}

export interface RawCallbackPayload {
  Body: {
    stkCallback: StkCallbackBody;
  };
}

export interface ParsedCallbackResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  success: boolean;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: Date;
  phoneNumber?: string;
}