import { GoogleConnector } from '@logto/connector-kit';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { LoadingIconWithContainer } from '@/components/LoadingLayer';
import useSocial from '@/containers/SocialSignInList/use-social';
import useFallbackRoute from '@/hooks/use-fallback-route';
import { useSieMethods } from '@/hooks/use-sie';

import styles from './index.module.scss';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const { socialConnectors } = useSieMethods();
  const { invokeSocialSignIn } = useSocial();
  const fallback = useFallbackRoute();
  const hasRunRef = useRef(false);
  const invokeSocialSignInRef = useRef(invokeSocialSignIn);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    invokeSocialSignInRef.current = invokeSocialSignIn;
  }, [invokeSocialSignIn]);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }

    if (method !== 'social') {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasRunRef.current = true;
      window.location.replace('/' + fallback);
      return;
    }

    if (socialConnectors.length === 0) {
      // Wait until connectors are loaded.
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasRunRef.current = true;
    const social = socialConnectors.find((connector) => connector.target === target);

    if (social && social.target !== GoogleConnector.target && social.target !== 'Institution') {
      void invokeSocialSignInRef.current(social);
      return;
    }

    if (target !== 'Institution') {
      window.location.replace('/' + fallback);
    }
  }, [fallback, method, socialConnectors, target]);

  return (
    <div className={styles.container}>
      <LoadingIconWithContainer />
    </div>
  );
};
export default DirectSignIn;
