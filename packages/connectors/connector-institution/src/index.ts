import {
  type SocialConnector,
  type CreateConnector,
  ConnectorType,
  type GetConnectorConfig,
  type GetAuthorizationUri,
  validateConfig,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { fuzhouConnectorConfigGuard } from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ appRedirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, fuzhouConnectorConfigGuard);
    const { institutionUrl } = fuzhouConnectorConfigGuard.parse(config);

    if (typeof appRedirectUri !== 'string') {
      return institutionUrl;
    }

    const authorizationUrl = new URL(institutionUrl);
    authorizationUrl.searchParams.set('app_redirect_uri', appRedirectUri);
    return authorizationUrl.toString();
  };

const createFuzhouConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: fuzhouConnectorConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: async () => {
      throw new Error('Not implemented');
    },
  };
};

export default createFuzhouConnector;
