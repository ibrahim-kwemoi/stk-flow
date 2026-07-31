import { ValidationError } from '../errors/ValidationError.js';

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.startsWith('0') && (cleaned.length === 10)) {
    return `254${cleaned.slice(1)}`;
  }
  if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    return `254${cleaned}`;
  }

  throw new ValidationError(`Invalid Kenyan phone number format: "${phone}"`, 'phoneNumber');
}