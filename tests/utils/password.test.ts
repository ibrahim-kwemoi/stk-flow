import { describe, it, expect } from 'vitest';
import { generatePassword } from '../../src/utils/password.js';

describe('generatePassword', () => {
  it('should produce a valid Base64 encoded password', () => {
    const shortCode = '174379';
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const timestamp = '20260801120000';

    const expectedRaw = `${shortCode}${passkey}${timestamp}`;
    const expectedBase64 = Buffer.from(expectedRaw).toString('base64');

    const result = generatePassword(shortCode, passkey, timestamp);
    expect(result).toBe(expectedBase64);
  });
});