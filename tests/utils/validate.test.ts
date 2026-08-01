import { describe, it, expect } from 'vitest';
import { validateInitiateParams } from '../../src/utils/validate.js';
import { ValidationError } from '../../src/errors/ValidationError.js';

describe('validateInitiateParams', () => {
  const validParams = {
    phoneNumber: '0712345678',
    amount: 100,
    accountReference: 'INV123',
    transactionDesc: 'Test Payment',
  };

  it('should pass with valid parameters', () => {
    expect(() => validateInitiateParams(validParams)).not.toThrow();
  });

  it('should fail if amount is negative or zero', () => {
    expect(() => validateInitiateParams({ ...validParams, amount: 0 })).toThrow(ValidationError);
    expect(() => validateInitiateParams({ ...validParams, amount: -50 })).toThrow(ValidationError);
  });

  it('should fail if accountReference exceeds 12 characters', () => {
    expect(() =>
      validateInitiateParams({ ...validParams, accountReference: 'VERY_LONG_REF_123' })
    ).toThrow(ValidationError);
  });

  it('should fail if transactionDesc exceeds 13 characters', () => {
    expect(() =>
      validateInitiateParams({ ...validParams, transactionDesc: 'Exceeding limit string' })
    ).toThrow(ValidationError);
  });
});