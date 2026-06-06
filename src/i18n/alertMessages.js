/**
 * Translated Alert helpers for non-React modules (upload services, etc.).
 */

import { Alert } from 'react-native';

import i18n from './index';

export const tError = (key, params) => i18n.t(key, { ns: 'errors', ...params });

export const showUploadAlert = (titleKey, messageKey, params) => {
  Alert.alert(tError(titleKey), tError(messageKey, params));
};

export const showUploadAlertWithActions = (titleKey, messageKey, buttons, params) => {
  Alert.alert(
    tError(titleKey),
    tError(messageKey, params),
    buttons.map((btn) => ({
      ...btn,
      text: btn.textKey ? tError(btn.textKey) : btn.text,
    })),
  );
};
