import { MpesaError } from './MpesaError.js';

export class ValidationError extends MpesaError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}