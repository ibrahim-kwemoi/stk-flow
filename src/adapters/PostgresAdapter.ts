import { StorageAdapter } from '../types/Adapter.js';
import { PaymentRecord, PaymentStatus } from '../types/Payment.js';

export interface PgPoolLike {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
}

export class PostgresAdapter implements StorageAdapter {
  constructor(
    private readonly pool: PgPoolLike,
    private readonly tableName = 'mpesa_payments'
  ) {}

  async save(record: Omit<PaymentRecord, 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    const now = new Date();
    const query = `
      INSERT INTO ${this.tableName} (
        id, merchant_request_id, checkout_request_id, account_reference,
        transaction_desc, phone_number, amount, status, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      record.id,
      record.merchantRequestId,
      record.checkoutRequestId,
      record.accountReference,
      record.transactionDesc,
      record.phoneNumber,
      record.amount,
      record.status,
      JSON.stringify(record.metadata || {}),
      now,
      now,
    ];

    await this.pool.query(query, values);
    return { ...record, createdAt: now, updatedAt: now };
  }

  async findByCheckoutRequestId(checkoutRequestId: string): Promise<PaymentRecord | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE checkout_request_id = $1 LIMIT 1;`;
    const { rows } = await this.pool.query(query, [checkoutRequestId]);
    if (!rows[0]) return null;

    const row = rows[0] as Record<string, unknown>;
    return this.mapRowToRecord(row);
  }

  async updateStatus(
    checkoutRequestId: string,
    status: PaymentStatus,
    details?: Partial<Pick<PaymentRecord, 'resultCode' | 'resultDesc' | 'mpesaReceiptNumber' | 'transactionDate'>>
  ): Promise<PaymentRecord> {
    const now = new Date();
    const query = `
      UPDATE ${this.tableName}
      SET status = $1, result_code = $2, result_desc = $3, mpesa_receipt_number = $4, transaction_date = $5, updated_at = $6
      WHERE checkout_request_id = $7
      RETURNING *;
    `;
    const values = [
      status,
      details?.resultCode ?? null,
      details?.resultDesc ?? null,
      details?.mpesaReceiptNumber ?? null,
      details?.transactionDate ?? null,
      now,
      checkoutRequestId,
    ];

    const { rows } = await this.pool.query(query, values);
    if (!rows[0]) {
      throw new Error(`Payment record with CheckoutRequestID ${checkoutRequestId} not found.`);
    }

    return this.mapRowToRecord(rows[0] as Record<string, unknown>);
  }

  private mapRowToRecord(row: Record<string, unknown>): PaymentRecord {
    return {
      id: row.id as string,
      merchantRequestId: row.merchant_request_id as string,
      checkoutRequestId: row.checkout_request_id as string,
      accountReference: row.account_reference as string,
      transactionDesc: row.transaction_desc as string,
      phoneNumber: row.phone_number as string,
      amount: Number(row.amount),
      status: row.status as PaymentStatus,
      resultCode: row.result_code !== null ? Number(row.result_code) : undefined,
      resultDesc: row.result_desc as string | undefined,
      mpesaReceiptNumber: row.mpesa_receipt_number as string | undefined,
      transactionDate: row.transaction_date ? new Date(row.transaction_date as string) : undefined,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata as Record<string, unknown>),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}