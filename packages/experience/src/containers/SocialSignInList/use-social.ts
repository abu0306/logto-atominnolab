import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  VerificationType,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { getSocialAuthorizationUrl } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import { usePromiseConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useTerms from '@/hooks/use-terms';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';
import { generateState, storeState, buildSocialLandingUri } from '@/utils/social-connectors';

const useSocial = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { i18n } = useTranslation();

  const handleError = useErrorHandler();
  const asyncInvokeSocialSignIn = useApi(getSocialAuthorizationUrl);
  const { show: showConfirmModal } = usePromiseConfirmModal();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const { setVerificationId } = useContext(UserInteractionContext);

  const redirectTo = useGlobalRedirectTo({
    shouldClearInteractionContextSession: false,
    isReplace: false,
  });

  const nativeSignInHandler = useCallback(
    (redirectTo: string, connector: ExperienceSocialConnector) => {
      const { id: connectorId, platform } = connector;

      const redirectUri =
        platform === ConnectorPlatform.Universal
          ? buildSocialLandingUri(`/social/landing/${connectorId}`, redirectTo).toString()
          : redirectTo;

      getLogtoNativeSdk()?.getPostMessage()({
        callbackUri: `${window.location.origin}/callback/social/${connectorId}`,
        redirectTo: redirectUri,
      });
    },
    []
  );

  const invokeSocialSignInHandler = useCallback(
    async (connector: ExperienceSocialConnector) => {
      /**
       * Check if the user has agreed to the terms and privacy policy before navigating to the 3rd-party social sign-in page
       * when the policy is set to `Manual`
       */

      const { id: connectorId, target } = connector;

      if (
        !['Institution', 'WeChatBridge'].includes(target) &&
        agreeToTermsPolicy === AgreeToTermsPolicy.Manual &&
        !(await termsValidation())
      ) {
        return;
      }

      if (target === 'WeChatBridge') {
        const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
        const i18nPrompt =
          resolvedLanguage === 'zh-CN' || resolvedLanguage.startsWith('zh-')
            ? connector.confirmationPromptI18n?.['zh-CN']
            : connector.confirmationPromptI18n?.en;

        const [isConfirmed] = await showConfirmModal({
          ModalContent:
            i18nPrompt ??
            connector.confirmationPrompt ??
            'You will be redirected to the WeChat site to continue sign-in. Please confirm to continue.',
        });

        if (!isConfirmed) {
          return;
        }
      }

      const state = generateState();
      storeState(state, connectorId);

      const [error, result] = await asyncInvokeSocialSignIn(
        connectorId,
        state,
        `${window.location.origin}/callback/${connectorId}`
      );

      if (error) {
        await handleError(error);
        return;
      }

      if (!result) {
        return;
      }

      const { verificationId, authorizationUri } = result;

      setVerificationId(VerificationType.Social, verificationId);

      if (isNativeWebview()) {
        nativeSignInHandler(authorizationUri, connector);
        return;
      }

      if (target === 'Institution') {
        await redirectTo(authorizationUri);
        return;
      }

      await redirectTo(authorizationUri);
    },
    [
      agreeToTermsPolicy,
      asyncInvokeSocialSignIn,
      handleError,
      i18n.language,
      i18n.resolvedLanguage,
      nativeSignInHandler,
      redirectTo,
      setVerificationId,
      showConfirmModal,
      termsValidation,
    ]
  );

  return {
    theme,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    invokeSocialSignIn: invokeSocialSignInHandler,
  };
};

export default useSocial;
