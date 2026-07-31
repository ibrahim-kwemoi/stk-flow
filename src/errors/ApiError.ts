import { MpesaError } from './MpesaError.js';

export class ApiError extends MpesaError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseCode?: string,
    public readonly rawResponse?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}