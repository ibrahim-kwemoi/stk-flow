import { AuthenticationError } from '../errors/AuthenticationError.js';
import { NetworkError } from '../errors/NetworkError.js';
import { InternalConfig } from '../types/Config.js';

interface OAuthTokenResponse {
  access_token: string;
  expires_in: string;
}

export class OAuthManager {
  private cachedToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor(private readonly config: InternalConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      return this.cachedToken;
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    const url = `${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AuthenticationError(`Failed to fetch OAuth token: ${response.statusText}`, errorText);
      }

      const data = (await response.json()) as OAuthTokenResponse;
      this.cachedToken = data.access_token;
      
      const expiresInMs = (parseInt(data.expires_in, 10) - 60) * 1000;
      this.tokenExpiryTime = Date.now() + expiresInMs;

      return this.cachedToken;
    } catch (err) {
      if (err instanceof AuthenticationError) throw err;
      throw new NetworkError('Failed to communicate with Daraja OAuth endpoint', err as Error);
    }
  }
}