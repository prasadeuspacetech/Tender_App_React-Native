import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../theme';

// ─── Variant config ───────────────────────────────────────────────────────────
const VARIANTS = {
  primary: {
    background:  theme.Colors.primary ?? '#062E52',      // ✅ was theme.colors.primary
    text:        theme.Colors.white ?? '#FFFFFF',         // ✅ was theme.colors.white
    borderColor: 'transparent',
    borderWidth: 0,
    loaderColor: theme.Colors.white ?? '#FFFFFF',         // ✅ was theme.colors.white
  },
  secondary: {
    background:  theme.Colors.surface ?? '#F1EFEF',      // ✅ was theme.colors.surface
    text:        theme.Colors.textPrimary ?? '#1A1A1A',  // ✅ was theme.colors.textPrimary
    borderColor: 'transparent',
    borderWidth: 0,
    loaderColor: theme.Colors.textPrimary ?? '#1A1A1A',  // ✅ was theme.colors.textPrimary
  },
  outline: {
    background:  'transparent',
    text:        theme.Colors.primary ?? '#062E52',       // ✅ was theme.colors.primary
    borderColor: theme.Colors.primary ?? '#062E52',       // ✅ was theme.colors.primary
    borderWidth: 1.5,
    loaderColor: theme.Colors.primary ?? '#062E52',       // ✅ was theme.colors.primary
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  style,
  textStyle,
}) => {
  const { t } = useTranslation('errors');
  const config = VARIANTS[variant] ?? VARIANTS.primary;
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      onPress={isInteractive ? onPress : undefined}
      activeOpacity={isInteractive ? 0.78 : 1}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: config.background,
          borderColor: config.borderColor,
          borderWidth: config.borderWidth,
        },
        fullWidth && styles.fullWidth,
        (!isInteractive) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={config.loaderColor}
          accessibilityLabel={t('accessibility.loading')}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[styles.label, { color: config.text }, textStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    width: 286,
    height: 45,
    borderRadius: theme.Radius?.md ?? 10,               // ✅ was theme.borderRadius?.md
    paddingVertical: theme.Spacing?.sm ?? 10,            // ✅ was theme.spacing?.sm
    paddingHorizontal: theme.Spacing?.xxl ?? 35,         // ✅ was theme.spacing?.xxl
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    // Shadow matching Figma: Y=4, Blur=4, color=#062E52, 25%
    shadowColor: theme.Colors.primary ?? '#062E52',      // ✅ was theme.colors.primary
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.FontFamily?.regular ?? 'Roboto',   // ✅ was theme.typography?.fonts?.body
    fontSize: theme.FontSize?.lg ?? 20,                  // ✅ was theme.typography?.sizes?.lg
    fontWeight: theme.FontWeight?.regular ?? '400',      // ✅ was theme.typography?.weights?.regular
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: theme.Spacing?.sm ?? 8,                 // ✅ was theme.spacing?.sm
  },
  rightIcon: {
    marginLeft: theme.Spacing?.sm ?? 8,                  // ✅ was theme.spacing?.sm
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PrimaryButton;