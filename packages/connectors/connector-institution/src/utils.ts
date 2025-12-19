import { assert, getSafe, removeUndefinedKeys } from '@silverhand/essentials';
import snakecaseKeys from 'snakecase-keys';

import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import { type KyResponse } from 'ky';

import type { ProfileMap, FuzhouAccessTokenResponse } from './types.js';
import { fuzhouAccessTokenResponseGuard, userProfileGuard } from './types.js';

const accessTokenResponseHandler = async (
  response: KyResponse
): Promise<FuzhouAccessTokenResponse> => {
  const responseContent = await response.text();
  const result = fuzhouAccessTokenResponseGuard.safeParse(parseJson(responseContent)); // Why it works with qs.parse()

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

export const genDigitRandom = (number_: number) => {
  const rand = Math.floor(Math.random() * 10 ** number_); // 0~99999999（8位随机数）
  return rand.toString().padStart(number_, '0');
};
