import { StorageAdapter } from './Adapter.js';

export type Environment = 'sandbox' | 'production';

export interface MpesaStkConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortCode: string;
  callbackUrl: string;
  environment?: Environment;
  adapter?: StorageAdapter;
  timeoutMs?: number;
}

export interface InternalConfig extends Required<Omit<MpesaStkConfig, 'adapter'>> {
  adapter: StorageAdapter;
  baseUrl: string;
}