import { MpesaError } from './MpesaError.js';

export class TimeoutError extends MpesaError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}