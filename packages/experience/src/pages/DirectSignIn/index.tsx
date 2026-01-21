import { GoogleConnector } from '@logto/connector-kit';
import { useEffect } from 'react';
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

  useEffect(() => {
    const social = socialConnectors.find((connector) => connector.target === target);

    if (social && social.target !== GoogleConnector.target && social.target !== 'Institution') {
      void invokeSocialSignIn(social);
      return;
    }

    if (target !== 'Institution') {
      window.location.replace('/' + fallback);
    }
  }, [fallback, invokeSocialSignIn, method, socialConnectors, target]);

  return (
    <div className={styles.container}>
      <LoadingIconWithContainer />
    </div>
  );
};
export default DirectSignIn;
