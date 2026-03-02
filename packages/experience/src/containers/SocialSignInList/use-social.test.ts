import { AgreeToTermsPolicy, type ExperienceSocialConnector } from '@logto/schemas';
import { renderHook } from '@testing-library/react-hooks';

import { socialConnectors } from '@/__mocks__/social-connectors';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useTerms from '@/hooks/use-terms';

import useSocial from './use-social';

let currentLanguage = 'en';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: currentLanguage,
      resolvedLanguage: currentLanguage,
    },
  }),
}));

jest.mock('@/hooks/use-api');
jest.mock('@/hooks/use-confirm-modal');
jest.mock('@/hooks/use-error-handler', () => jest.fn(() => jest.fn()));
jest.mock('@/hooks/use-global-redirect-to');
jest.mock('@/hooks/use-terms');
jest.mock('@/utils/native-sdk', () => ({
  getLogtoNativeSdk: jest.fn(),
  isNativeWebview: jest.fn(() => false),
}));
jest.mock('@/utils/social-connectors', () => ({
  buildSocialLandingUri: jest.fn(),
  generateState: jest.fn(() => 'mock-state'),
  storeState: jest.fn(),
}));

const invokeAuthorizationApi = jest.fn();
const showConfirmModal = jest.fn();
const termsValidation = jest.fn(async () => true);

const makeConnector = (
  target: string,
  confirmationPrompt?: string,
  confirmationPromptI18n?: ExperienceSocialConnector['confirmationPromptI18n']
): ExperienceSocialConnector => {
  const baseConnector = socialConnectors[0];

  if (!baseConnector) {
    throw new Error('Missing social connector fixture');
  }

  return {
    ...baseConnector,
    id: `id-${target}`,
    target,
    confirmationPrompt,
    confirmationPromptI18n,
    name: {
      ...baseConnector.name,
      en: target,
    },
  };
};

describe('useSocial WeChatBridge confirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentLanguage = 'en';

    (useApi as jest.MockedFunction<typeof useApi>).mockReturnValue(invokeAuthorizationApi);
    (usePromiseConfirmModal as jest.MockedFunction<typeof usePromiseConfirmModal>).mockReturnValue({
      show: showConfirmModal,
    });
    (useTerms as jest.MockedFunction<typeof useTerms>).mockReturnValue({
      termsOfUseUrl: undefined,
      privacyPolicyUrl: undefined,
      termsAgreement: false,
      isTermsDisabled: true,
      agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
      termsValidation,
      setTermsAgreement: jest.fn(),
      termsAndPrivacyConfirmModalHandler: jest.fn(async () => true),
    });
    (useGlobalRedirectTo as jest.MockedFunction<typeof useGlobalRedirectTo>).mockReturnValue(jest.fn());
  });

  it('shows confirmation modal for WeChatBridge and stops when canceled', async () => {
    showConfirmModal.mockResolvedValue([false]);

    const { result } = renderHook(() => useSocial());

    await result.current.invokeSocialSignIn(makeConnector('WeChatBridge'));

    expect(showConfirmModal).toHaveBeenCalledTimes(1);
    expect(showConfirmModal).toHaveBeenCalledWith({
      ModalContent:
        'You will be redirected to the WeChat site to continue sign-in. Please confirm to continue.',
    });
    expect(invokeAuthorizationApi).not.toHaveBeenCalled();
  });

  it('skips terms modal validation for WeChatBridge when terms policy is manual', async () => {
    showConfirmModal.mockResolvedValue([false]);
    (useTerms as jest.MockedFunction<typeof useTerms>).mockReturnValue({
      termsOfUseUrl: 'https://example.com/terms',
      privacyPolicyUrl: 'https://example.com/privacy',
      termsAgreement: false,
      isTermsDisabled: false,
      agreeToTermsPolicy: AgreeToTermsPolicy.Manual,
      termsValidation,
      setTermsAgreement: jest.fn(),
      termsAndPrivacyConfirmModalHandler: jest.fn(async () => false),
    });

    const { result } = renderHook(() => useSocial());

    await result.current.invokeSocialSignIn(makeConnector('WeChatBridge'));

    expect(termsValidation).not.toHaveBeenCalled();
    expect(showConfirmModal).toHaveBeenCalledTimes(1);
    expect(invokeAuthorizationApi).not.toHaveBeenCalled();
  });

  it('uses connector configured confirmation copy for WeChatBridge', async () => {
    showConfirmModal.mockResolvedValue([false]);

    const { result } = renderHook(() => useSocial());

    await result.current.invokeSocialSignIn(
      makeConnector('WeChatBridge', '请确认后跳转到 WeChat 站点继续登录。')
    );

    expect(showConfirmModal).toHaveBeenCalledWith({
      ModalContent: '请确认后跳转到 WeChat 站点继续登录。',
    });
    expect(invokeAuthorizationApi).not.toHaveBeenCalled();
  });

  it('uses zh-CN prompt when locale is zh-CN', async () => {
    currentLanguage = 'zh-CN';
    showConfirmModal.mockResolvedValue([false]);

    const { result } = renderHook(() => useSocial());

    await result.current.invokeSocialSignIn(
      makeConnector('WeChatBridge', undefined, {
        en: 'Confirm in English',
        'zh-CN': '请确认后跳转。',
      })
    );

    expect(showConfirmModal).toHaveBeenCalledWith({
      ModalContent: '请确认后跳转。',
    });
    expect(invokeAuthorizationApi).not.toHaveBeenCalled();
  });

  it('does not show confirmation modal for non-WeChatBridge connectors', async () => {
    invokeAuthorizationApi.mockResolvedValue([undefined, undefined]);

    const { result } = renderHook(() => useSocial());

    await result.current.invokeSocialSignIn(makeConnector('wechat'));

    expect(showConfirmModal).not.toHaveBeenCalled();
    expect(invokeAuthorizationApi).toHaveBeenCalledTimes(1);
  });
});
