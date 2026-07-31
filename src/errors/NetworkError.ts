import { MpesaError } from './MpesaError.js';

export class NetworkError extends MpesaError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}