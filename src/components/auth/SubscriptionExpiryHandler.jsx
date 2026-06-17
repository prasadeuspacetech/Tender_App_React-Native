import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import useSubscriptionExpiry from '../../hooks/useSubscriptionExpiry';
import { resetToActivation } from '../../navigation/navigationRef';
import useAuthStore from '../../store/useAuthStore';

/**
 * App-wide subscription expiry watcher — runs while NavigationContainer is mounted.
 */
const SubscriptionExpiryHandler = () => {
  const { t } = useTranslation('auth');
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const isActivated = useAuthStore((state) => state.isActivated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const handlingRef = useRef(false);

  const handleExpired = useCallback(() => {
    if (handlingRef.current) return;
    handlingRef.current = true;

    clearSession();
    resetToActivation();

    Alert.alert(t('expiredTitle'), t('expiredMessage'), [
      { text: t('backToLogin'), onPress: () => { handlingRef.current = false; } },
    ]);
  }, [clearSession, t]);

  useSubscriptionExpiry(isActivated ? expiresAt : null, handleExpired);

  return null;
};

export default SubscriptionExpiryHandler;
