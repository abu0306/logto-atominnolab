import { assert, conditional, pick } from '@silverhand/essentials';

import {
  type GetAuthorizationUri,
  type GetUserInfo,
  type SocialConnector,
  type CreateConnector,
  type GetConnectorConfig,
  parseJsonObject,
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  type GetTokenResponseAndUserInfo,
  type GetAccessTokenByRefreshToken,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  defaultMetadata,
  defaultTimeout,
  userInfoEndpoint,
} from './constant.js';
import { type FudanConnectorConfig, fudanConnectorConfigGuard } from './types.js';
import {
  constructAuthorizationUri,
  userProfileMapping,
  getAccessToken,
  getAccessTokenByRefreshToken as _getAccessTokenByRefreshToken,
} from './utils.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, fudanConnectorConfigGuard);
    const parsedConfig = fudanConnectorConfigGuard.parse(config);

    await setSession({ redirectUri });

    return constructAuthorizationUri(authorizationEndpoint, {
      ...pick(parsedConfig, 'responseType', 'clientId', 'scope'),
      redirectUri,
      state,
      // If scope is provided, it will override the scope in the config.
      ...conditional(scope && { scope }),
    });
  };

const _getUserInfo = async (
  config: FudanConnectorConfig,
  token_type: string,
  access_token: string
) => {
  try {
    const httpResponse = await ky.get(userInfoEndpoint, {
      headers: {
        authorization: `${token_type} ${access_token}`,
      },
      timeout: defaultTimeout,
    });

    const rawData = parseJsonObject(await httpResponse.text());

    return { ...userProfileMapping(rawData, config.profileMap), rawData };
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
    }

    throw error;
  }
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, fudanConnectorConfigGuard);
    const parsedConfig = fudanConnectorConfigGuard.parse(config);

    const { redirectUri } = await getSession();
    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      })
    );

    const { access_token, token_type } = await getAccessToken(parsedConfig, data, redirectUri);
    return _getUserInfo(parsedConfig, token_type, access_token);
  };

const getTokenResponseAndUserInfo =
  (getConfig: GetConnectorConfig): GetTokenResponseAndUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, fudanConnectorConfigGuard);
    const parsedConfig = fudanConnectorConfigGuard.parse(config);

    const { redirectUri } = await getSession();
    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      })
    );

    const tokenResponse = await getAccessToken(parsedConfig, data, redirectUri);
    const userInfo = await _getUserInfo(
      parsedConfig,
      tokenResponse.token_type,
      tokenResponse.access_token
    );
    return {
      tokenResponse,
      userInfo,
    };
  };

const getAccessTokenByRefreshToken =
  (getConfig: GetConnectorConfig): GetAccessTokenByRefreshToken =>
  async (refreshToken: string) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, fudanConnectorConfigGuard);

    return _getAccessTokenByRefreshToken(config, refreshToken);
  };

const createFudanConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: fudanConnectorConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
    getTokenResponseAndUserInfo: getTokenResponseAndUserInfo(getConfig),
    getAccessTokenByRefreshToken: getAccessTokenByRefreshToken(getConfig),
  };
};

export default createFudanConnector;
