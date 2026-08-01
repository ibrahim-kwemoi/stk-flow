import { describe, it, expect } from 'vitest';
import { normalizePhone } from '../../src/utils/normalizePhone.js';
import { ValidationError } from '../../src/errors/ValidationError.js';

describe('normalizePhone', () => {
  it('should preserve valid 254 numbers', () => {
    expect(normalizePhone('254712345678')).toBe('254712345678');
  });

  it('should format 07... numbers to 2547...', () => {
    expect(normalizePhone('0712345678')).toBe('254712345678');
  });

  it('should format 01... numbers to 2541...', () => {
    expect(normalizePhone('0112345678')).toBe('254112345678');
  });

  it('should format 9-digit numbers starting with 7 or 1', () => {
    expect(normalizePhone('712345678')).toBe('254712345678');
    expect(normalizePhone('112345678')).toBe('254112345678');
  });

  it('should strip non-digit characters and format', () => {
    expect(normalizePhone('+254 (712) 345-678')).toBe('254712345678');
  });

  it('should throw ValidationError for invalid phone lengths or formats', () => {
    expect(() => normalizePhone('12345')).toThrow(ValidationError);
    expect(() => normalizePhone('0812345678')).toThrow(ValidationError);
  });
});