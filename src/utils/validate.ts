import { ValidationError } from '../errors/ValidationError.js';
import { InitiatePaymentParams } from '../types/InitiatePayment.js';

export function validateInitiateParams(params: InitiatePaymentParams): void {
  if (!params.amount || typeof params.amount !== 'number' || params.amount <= 0) {
    throw new ValidationError('Amount must be a positive number', 'amount');
  }

  if (!params.accountReference || params.accountReference.trim().length === 0) {
    throw new ValidationError('Account reference is required', 'accountReference');
  }

  if (params.accountReference.length > 12) {
    throw new ValidationError('Account reference cannot exceed 12 characters', 'accountReference');
  }

  if (!params.transactionDesc || params.transactionDesc.trim().length === 0) {
    throw new ValidationError('Transaction description is required', 'transactionDesc');
  }

  if (params.transactionDesc.length > 13) {
    throw new ValidationError('Transaction description cannot exceed 13 characters', 'transactionDesc');
  }
}