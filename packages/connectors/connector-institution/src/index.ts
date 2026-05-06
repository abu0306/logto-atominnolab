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
  async ({ state, redirectUri, appRedirectUri, scope }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, fuzhouConnectorConfigGuard);
    console.log(
      '============config============',
      config,
      state,
      redirectUri,
      appRedirectUri,
      scope
    );
    const parsedConfig = fuzhouConnectorConfigGuard.parse(config);
    console.log('=====================', parsedConfig);
    return parsedConfig.institutionUrl;
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
