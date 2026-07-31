import { InternalConfig } from '../types/Config.js';
import { OAuthManager } from './OAuth.js';
import { StkPushClient } from './StkPush.js';
import { StkQueryClient } from './StkQuery.js';

export class DarajaClient {
  public readonly oauth: OAuthManager;
  public readonly stkPush: StkPushClient;
  public readonly stkQuery: StkQueryClient;

  constructor(config: InternalConfig) {
    this.oauth = new OAuthManager(config);
    this.stkPush = new StkPushClient(config, this.oauth);
    this.stkQuery = new StkQueryClient(config, this.oauth);
  }
}