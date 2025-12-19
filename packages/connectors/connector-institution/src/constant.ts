import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'institution',
  target: 'Institution',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Institution Login',
    'zh-CN': '机构登录',
    'tr-TR': 'Institution Login',
    ko: 'Institution Login',
  },
  logo: 'https://cdn.atominnolab.com/university/institution.svg',
  logoDark: null,
  description: {
    en: 'Institution Login',
    'zh-CN': '机构登录',
    'tr-TR': 'Institution Login',
    ko: 'Institution Login',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'institutionUrl',
      label: '机构登录地址',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<institution-url>',
    },
  ],
  isTokenStorageSupported: true,
};

export const defaultTimeout = 5000;
