import { MpesaError } from './MpesaError.js';

export class AuthenticationError extends MpesaError {
  constructor(message: string, public readonly rawResponse?: unknown) {
    super(message);
    this.name = 'AuthenticationError';
  }
}