import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://id.fudan.edu.cn/idp/authCenter/authenticate';
export const accessTokenEndpoint = 'https://id.fudan.edu.cn/idp/api/v3/oauth2/token';
export const userInfoEndpoint = 'https://id.fudan.edu.cn/idp/api/v3/oauth2/userInfo';
export const scope = 'openid profile email';

export const defaultMetadata: ConnectorMetadata = {
  id: 'Fudan',
  target: 'FudanUniversity',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Fudan University',
    'zh-CN': '复旦大学',
    'tr-TR': 'Fudan University',
    ko: 'Fudan University',
  },
  logo: 'https://cdn.atominnolab.com/university/fudan.svg',
  logoDark: null,
  description: {
    en: 'Fudan University',
    'zh-CN': '复旦大学',
    'tr-TR': 'Fudan University',
    ko: 'Fudan University',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      label: 'Client ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      label: 'Client Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<client-secret>',
    },
    {
      key: 'scope',
      label: 'Scope',
      type: ConnectorConfigFormItemType.MultilineText,
      required: false,
      placeholder: 'Enter the scopes (separated by a space)',
    },
    {
      key: 'profileMap',
      label: 'Profile Map',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {
        id: 'user_id',
        email: 'email_verified',
        phone: 'phone_verified',
        name: 'full_name',
        avatar: 'avatar_url',
      },
    },
  ],
  isTokenStorageSupported: true,
};

export const defaultTimeout = 5000;
