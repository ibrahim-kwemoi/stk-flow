import { ValidationError } from '../errors/ValidationError.js';

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // 12-digit format: 2547... or 2541...
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    const nextDigit = cleaned.charAt(3);
    if (nextDigit === '7' || nextDigit === '1') {
      return cleaned;
    }
  }

  // 10-digit format: 07... or 01...
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    const secondDigit = cleaned.charAt(1);
    if (secondDigit === '7' || secondDigit === '1') {
      return `254${cleaned.slice(1)}`;
    }
  }

  // 9-digit format: 7... or 1...
  if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    return `254${cleaned}`;
  }

  throw new ValidationError(`Invalid Kenyan phone number format: "${phone}"`, 'phoneNumber');
}