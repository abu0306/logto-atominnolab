import type {
  CreateConnector,
  GetAuthorizationUri,
  GetConnectorConfig,
  SocialConnector,
} from '@logto/connector-kit';
import { ConnectorType, validateConfig } from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { wechatBridgeConnectorConfigGuard } from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async () => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, wechatBridgeConnectorConfigGuard);
    const parsedConfig = wechatBridgeConnectorConfigGuard.parse(config);

    return parsedConfig.wechatUrl;
  };

const createWechatBridgeConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: wechatBridgeConnectorConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: async () => {
      throw new Error('Not implemented');
    },
  };
};

export default createWechatBridgeConnector;
