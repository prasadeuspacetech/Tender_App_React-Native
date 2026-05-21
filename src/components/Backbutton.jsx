import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../theme';
import { FigmaBackIcon, FIGMA_HEADER_ICON_SIZE } from './icons/HeaderIcons';

const BackButton = ({
  onPress,
  style,
  iconColor = theme.Colors.white ?? '#FFFFFF',
  iconSize = FIGMA_HEADER_ICON_SIZE,
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={disabled ? undefined : onPress}
    activeOpacity={disabled ? 1 : 0.65}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityRole="button"
    accessibilityLabel="Go back"
    accessibilityState={{ disabled }}
    style={[styles.wrapper, style, disabled && styles.disabled]}
  >
    <FigmaBackIcon size={iconSize} color={iconColor} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.Spacing?.xs ?? 4,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default BackButton;
