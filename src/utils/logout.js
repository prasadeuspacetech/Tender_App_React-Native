import { Alert } from 'react-native';

import i18n from '../i18n';
import { resetToActivation } from '../navigation/navigationRef';
import useAuthStore from '../store/useAuthStore';

const tSettings = (key) => i18n.t(key, { ns: 'settings' });

/** Shared logout flow — clears auth session and resets navigation to Activation. */
export const performLogout = () => {
  Alert.alert(tSettings('logout.confirmTitle'), tSettings('logout.confirmMessage'), [
    { text: tSettings('logout.cancel'), style: 'cancel' },
    {
      text: tSettings('logout.confirmButton'),
      style: 'destructive',
      onPress: () => {
        useAuthStore.getState().clearSession();
        resetToActivation();
      },
    },
  ]);
};
