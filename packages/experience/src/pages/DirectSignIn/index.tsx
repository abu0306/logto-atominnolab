import { GoogleConnector } from '@logto/connector-kit';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { LoadingIconWithContainer } from '@/components/LoadingLayer';
import useSocial from '@/containers/SocialSignInList/use-social';
import useFallbackRoute from '@/hooks/use-fallback-route';
import { useSieMethods } from '@/hooks/use-sie';
import useSingleSignOn from '@/hooks/use-single-sign-on';

import styles from './index.module.scss';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const { directSocialConnectors, ssoConnectors } = useSieMethods();
  const { invokeSocialSignIn } = useSocial();
  const invokeSingleSignOn = useSingleSignOn();
  const fallback = useFallbackRoute();
  const hasRunRef = useRef(false);
  const invokeSocialSignInRef = useRef(invokeSocialSignIn);
  const invokeSingleSignOnRef = useRef(invokeSingleSignOn);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    invokeSocialSignInRef.current = invokeSocialSignIn;
  }, [invokeSocialSignIn]);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    invokeSingleSignOnRef.current = invokeSingleSignOn;
  }, [invokeSingleSignOn]);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }

    if (method !== 'social' && method !== 'sso') {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasRunRef.current = true;
      window.location.replace('/' + fallback);
      return;
    }

    if (method === 'sso') {
      if (ssoConnectors.length === 0) {
        return;
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasRunRef.current = true;
      const sso = ssoConnectors.find((connector) => connector.id === target);

      if (sso) {
        void invokeSingleSignOnRef.current(sso.id);
        return;
      }

      window.location.replace('/' + fallback);
      return;
    }

    if (directSocialConnectors.length === 0) {
      // Wait until connectors are loaded.
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasRunRef.current = true;
    const social = directSocialConnectors.find((connector) => connector.target === target);

    if (social && social.target !== GoogleConnector.target && social.target !== 'Institution') {
      void invokeSocialSignInRef.current(social);
      return;
    }

    if (target !== 'Institution') {
      window.location.replace('/' + fallback);
    }
  }, [directSocialConnectors, fallback, method, ssoConnectors, target]);

  return (
    <div className={styles.container}>
      <LoadingIconWithContainer />
    </div>
  );
};
export default DirectSignIn;
