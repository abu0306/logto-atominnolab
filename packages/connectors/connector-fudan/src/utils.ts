import { assert, getSafe, removeUndefinedKeys } from '@silverhand/essentials';
import snakecaseKeys from 'snakecase-keys';

import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import { type KyResponse } from 'ky';
import ky, { HTTPError } from 'ky';

import { accessTokenEndpoint } from './constant.js';
import type { FudanConnectorConfig, ProfileMap, FudanAccessTokenResponse } from './types.js';
import {
  fudanAccessTokenResponseGuard,
  fudanAuthResponseGuard,
  userProfileGuard,
} from './types.js';

const accessTokenResponseHandler = async (
  response: KyResponse
): Promise<FudanAccessTokenResponse> => {
  const responseContent = await response.text();
  const result = fudanAccessTokenResponseGuard.safeParse(parseJson(responseContent)); // Why it works with qs.parse()

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  assert(
    result.data.access_token,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
      message: 'Can not find `access_token` in token response!',
    })
  );

  return result.data;
};

export const userProfileMapping = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  originUserProfile: object,
  keyMapping: ProfileMap
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mappedUserProfile = Object.fromEntries(
    Object.entries(keyMapping)
      .map(([destination, source]) => [destination, getSafe(originUserProfile, source)])
      .filter(([_, value]) => value)
  );

  const result = userProfileGuard.safeParse(mappedUserProfile);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

export const getAccessToken = async (
  config: FudanConnectorConfig,
  data: unknown,
  redirectUri: string
) => {
  const result = fudanAuthResponseGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, data);
  }

  const { code } = result.data;

  const { grantType, clientId, clientSecret } = config;

  const tokenResponse = await requestTokenEndpoint({
    tokenRequestBody: {
      grantType,
      code,
      redirectUri,
      clientId,
      clientSecret,
    },
  });

  return accessTokenResponseHandler(tokenResponse);
};

export const getAccessTokenByRefreshToken = async (
  config: FudanConnectorConfig,
  refreshToken: string
): Promise<FudanAccessTokenResponse> => {
  const { clientId, clientSecret } = config;

  const tokenResponse = await requestTokenEndpoint({
    tokenRequestBody: {
      grantType: 'refresh_token',
      refreshToken,
      clientId,
      clientSecret,
    },
  });

  return accessTokenResponseHandler(tokenResponse);
};

export type RequestTokenEndpointOptions = {
  tokenRequestBody:
    | ({
        grantType: string;
        code: string;
        redirectUri: string;
        clientId: string;
        clientSecret: string;
      } & Record<string, string>)
    | ({
        grantType: string;
        refreshToken: string;
        clientId: string;
        clientSecret: string;
      } & Record<string, string>);
  timeout?: number;
};

export const requestTokenEndpoint = async ({
  tokenRequestBody,
  timeout,
}: RequestTokenEndpointOptions) => {
  const postTokenEndpoint = async ({
    form,
    headers,
  }: {
    form: Record<string, string>;
    headers?: Record<string, string>;
  }) => {
    try {
      return await ky.post(accessTokenEndpoint, {
        headers,
        body: new URLSearchParams(removeUndefinedKeys(snakecaseKeys(form))),
        timeout,
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
      }

      throw error;
    }
  };

  const { clientId, clientSecret, ...requestBody } = tokenRequestBody;
  return postTokenEndpoint({
    form: requestBody,
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
  });
};

export const constructAuthorizationUri = (
  authorizationEndpoint: string,
  queryParameters: {
    responseType: string;
    clientId: string;
    scope?: string;
    redirectUri: string;
    state: string;
  } & Record<string, string | undefined>
) =>
  `${authorizationEndpoint}?${new URLSearchParams(
    removeUndefinedKeys(snakecaseKeys(queryParameters))
  ).toString()}`;
