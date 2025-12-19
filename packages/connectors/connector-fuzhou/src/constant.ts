import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://sso.fzu.edu.cn/oauth2.0/authorize';
export const accessTokenEndpoint = 'https://sso.fzu.edu.cn/oauth2.0/accessToken';
export const userInfoEndpoint = 'https://sso.fzu.edu.cn/oauth2.0/profile';
export const scope = 'openid profile email';

export const defaultMetadata: ConnectorMetadata = {
  id: 'Fuzhou',
  target: 'FuzhouUniversity',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Fuzhou University',
    'zh-CN': '福州大学',
    'tr-TR': 'Fuzhou University',
    ko: 'Fuzhou University',
  },
  logo: 'https://cdn.atominnolab.com/university/fuzhou.svg',
  logoDark: null,
  description: {
    en: 'Fuzhou University',
    'zh-CN': '福州大学',
    'tr-TR': 'Fuzhou University',
    ko: 'Fuzhou University',
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
