import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  InputAccessoryView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  activateSubscription,
  ACTIVATION_ERROR_CODES,
  sanitizeMobileInput,
  sanitizeSubscriptionKeyInput,
  SUBSCRIPTION_KEY_LENGTH,
} from '../../services/subscriptionService';
import useAuthStore from '../../store/useAuthStore';
import { isActivationNetworkAvailable } from '../../utils/activationNetwork';
import {
  Colors,
  FontFamily,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
  Layout,
  Typography,
  Input as InputTheme,
} from '../../theme';

const DESIGN_FRAME = 375;
const s = (n) => (Layout.screenWidth / DESIGN_FRAME) * n;

const CARD_WIDTH = s(286);
const CARD_RADIUS = s(39);
const AVATAR_SIZE = s(74);

const ARC_LG = Layout.screenWidth * 1.55;
const ARC_MD = Layout.screenWidth * 1.25;
const IOS_INPUT_ACCESSORY_ID = 'activation-empty-accessory';

const activationErrorKeys = {
  [ACTIVATION_ERROR_CODES.INVALID_MOBILE]: {
    titleKey: 'invalidMobileTitle',
    messageKey: 'invalidMobileMessage',
  },
  [ACTIVATION_ERROR_CODES.INVALID_KEY]: {
    titleKey: 'invalidKeyTitle',
    messageKey: 'invalidKeyMessage',
  },
  [ACTIVATION_ERROR_CODES.USER_NOT_FOUND]: {
    titleKey: 'activationFailedTitle',
    messageKey: 'userNotFoundMessage',
  },
  [ACTIVATION_ERROR_CODES.EXPIRED]: {
    titleKey: 'expiredTitle',
    messageKey: 'expiredMessage',
  },
  [ACTIVATION_ERROR_CODES.NETWORK_ERROR]: {
    titleKey: 'networkErrorTitle',
    messageKey: 'networkErrorMessage',
  },
};

const ActivationScreen = ({ navigation }) => {
  const { t } = useTranslation('auth');
  const setSession = useAuthStore((state) => state.setSession);
  const [mobileNumber, setMobileNumber] = useState('');
  const [subscriptionKey, setSubscriptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showNoInternetToast = () => {
    setToastMessage(t('noInternetMessage'));
  };

  const showActivationError = (code) => {
    const keys = activationErrorKeys[code] ?? activationErrorKeys[ACTIVATION_ERROR_CODES.NETWORK_ERROR];
    Alert.alert(t(keys.titleKey), t(keys.messageKey), [{ text: t('ok') }]);
  };

  const handleActivate = async () => {
    if (loading) return;

    const online = await isActivationNetworkAvailable();
    if (!online) {
      showNoInternetToast();
      return;
    }

    setLoading(true);
    try {
      const result = await activateSubscription(mobileNumber, subscriptionKey);
      if (!result.success) {
        showActivationError(result.code);
        return;
      }

      setSession(result.userData, result.subscription);
      navigation.replace('MainApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.arcTopRight} />
      <View style={styles.arcBottomLeft} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.welcomeText}>{t('welcome')}</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('mobileNumber')}</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(sanitizeMobileInput(text))}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                placeholderTextColor={Colors.textPlaceholder}
                inputAccessoryViewID={
                  Platform.OS === 'ios' ? IOS_INPUT_ACCESSORY_ID : undefined
                }
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('subscriptionKey')}</Text>
              <TextInput
                style={[styles.input, styles.keyInput]}
                value={subscriptionKey}
                onChangeText={(text) =>
                  setSubscriptionKey(sanitizeSubscriptionKeyInput(text))
                }
                autoCapitalize="characters"
                maxLength={SUBSCRIPTION_KEY_LENGTH}
                returnKeyType="done"
                onSubmitEditing={handleActivate}
                editable={!loading}
                placeholderTextColor={Colors.textPlaceholder}
                inputAccessoryViewID={
                  Platform.OS === 'ios' ? IOS_INPUT_ACCESSORY_ID : undefined
                }
              />
            </View>

            <TouchableOpacity
              style={[styles.activateButton, loading && styles.activateButtonDisabled]}
              onPress={handleActivate}
              activeOpacity={0.82}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.activateButtonText}>{t('activateApp')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {toastMessage ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={IOS_INPUT_ACCESSORY_ID}>
          <View style={styles.hiddenInputAccessory} />
        </InputAccessoryView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  arcTopRight: {
    position: 'absolute',
    width: ARC_LG,
    height: ARC_LG,
    borderRadius: ARC_LG / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    top: -(ARC_LG * 0.42),
    right: -(ARC_LG * 0.38),
  },
  arcBottomLeft: {
    position: 'absolute',
    width: ARC_MD,
    height: ARC_MD,
    borderRadius: ARC_MD / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    bottom: -(ARC_MD * 0.52),
    left: -(ARC_MD * 0.28),
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    position: 'relative',
    marginTop: AVATAR_SIZE / 2,
  },
  card: {
    width: '100%',
    borderRadius: CARD_RADIUS,
    backgroundColor: 'rgba(235, 236, 237, 0.18)',
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: Typography.h3.fontSize,
    lineHeight: Typography.h3.lineHeight,
    color: Colors.textInverse,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  fieldGroup: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontFamily: FontFamily.regular,
    fontSize: Typography.bodySm.fontSize,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  input: {
    width: '100%',
    height: InputTheme.heightSm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.input,
    borderWidth: InputTheme.borderWidth,
    borderColor: Colors.borderDefault,
    paddingHorizontal: InputTheme.paddingH,
    fontFamily: FontFamily.regular,
    fontSize: Typography.inputText.fontSize,
    color: Colors.inputText,
  },
  keyInput: {
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    letterSpacing: 1,
  },
  activateButton: {
    marginTop: Spacing.lg,
    width: '100%',
    height: Layout.buttonHeight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  activateButtonDisabled: {
    opacity: 0.85,
  },
  activateButtonText: {
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeight.semiBold,
    fontSize: Typography.buttonText.fontSize,
    letterSpacing: Typography.buttonText.letterSpacing,
    color: Colors.primary,
  },
  toast: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.xxl,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  toastText: {
    fontFamily: FontFamily.regular,
    fontSize: Typography.bodySm.fontSize,
    color: Colors.textInverse,
    textAlign: 'center',
    lineHeight: 20,
  },
  hiddenInputAccessory: {
    height: 0,
  },
});

export default ActivationScreen;
