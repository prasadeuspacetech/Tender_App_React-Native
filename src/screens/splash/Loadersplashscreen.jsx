// src/screens/splash/LoaderSplashScreen.js
//
// CHANGE from previous version:
//   navigation.replace('MainApp')  →  navigation.replace('Activation')
//   All other logic unchanged.

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Spacing,
} from '../../theme';

// ─────────────────────────────────────────────────────────────────────────────
// Figma text spec:
//   Roboto SemiBold 600 | 36px | LineHeight 121% | LetterSpacing 11%
//
// Theme notes:
//   • FontSize.h2 (32) is the closest defined step — 36 is derived as h2 + 4
//   • LineHeight.tight (1.2) ≈ Figma's 121%
//   • LetterSpacing = fontSize × 0.11  (Figma's 11%)
//
// Figma spinner: 40×40 | Thickness 4dp | Flat | Indeterminate
// ─────────────────────────────────────────────────────────────────────────────

const TITLE_FONT_SIZE   = FontSize.h2 + 4;                              // 36
const TITLE_LINE_HEIGHT = Math.round(TITLE_FONT_SIZE * LineHeight.tight); // ~43
const TITLE_LETTER_SPC  = +(TITLE_FONT_SIZE * 0.11).toFixed(2);          // ~3.96

const LoaderSplashScreen = ({ navigation }) => {
  const { t } = useTranslation('auth');

  useEffect(() => {
    let cancelled = false;

    const navigateNext = () => {
      if (cancelled) return;
      const isValid = useAuthStore.getState().isSessionValid();
      navigation.replace(isValid ? 'MainApp' : 'Activation');
    };

    const waitForHydration = () =>
      new Promise((resolve) => {
        if (useAuthStore.persist.hasHydrated()) {
          resolve();
          return;
        }
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });

    const minSplash = new Promise((resolve) => setTimeout(resolve, 1500));

    Promise.all([minSplash, waitForHydration()]).then(navigateNext);

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>{t('appTitle')}</Text>

        <ActivityIndicator
          size={40}                      // Figma: 40×40
          color={Colors.textInverse}     // white on navy
          style={styles.spinner}
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,    // #062E52
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
  },

  title: {
    fontFamily:    FontFamily.semiBold,  // 'Roboto-Medium' — closest available
    fontWeight:    FontWeight.semiBold,  // '600'
    fontSize:      TITLE_FONT_SIZE,      // 36
    lineHeight:    TITLE_LINE_HEIGHT,    // ~43 (121%)
    letterSpacing: TITLE_LETTER_SPC,    // ~3.96 (11%)
    color:         Colors.textInverse,  // #FFFFFF
    textAlign:     'center',
  },

  spinner: {
    marginTop: Spacing.lg,              // 24
  },
});

export default LoaderSplashScreen;