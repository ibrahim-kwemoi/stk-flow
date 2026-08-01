import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthManager } from '../../src/client/OAuth.js';
import { AuthenticationError } from '../../src/errors/AuthenticationError.js';
import { InternalConfig } from '../../src/types/Config.js';
import { MemoryAdapter } from '../../src/adapters/MemoryAdapter.js';

describe('OAuthManager', () => {
  const config: InternalConfig = {
    consumerKey: 'key',
    consumerSecret: 'secret',
    passkey: 'passkey',
    shortCode: '174379',
    callbackUrl: 'http://localhost/callback',
    environment: 'sandbox',
    baseUrl: 'https://sandbox.safaricom.co.ke',
    adapter: new MemoryAdapter(),
    timeoutMs: 60000,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and cache the access token', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'token_123', expires_in: '3599' }), { status: 200 })
    );

    const oauth = new OAuthManager(config);
    const token1 = await oauth.getAccessToken();
    const token2 = await oauth.getAccessToken();

    expect(token1).toBe('token_123');
    expect(token2).toBe('token_123');
    expect(mockFetch).toHaveBeenCalledTimes(1); // Second call used cache
  });

  it('should throw AuthenticationError when Daraja API rejects credentials', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    );

    const oauth = new OAuthManager(config);
    await expect(oauth.getAccessToken()).rejects.toThrow(AuthenticationError);
  });
});