import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import theme from '../theme';

// ─── Bell icon drawn entirely with Views — zero icon-library dependency ────────
const BellIcon = ({ size = 20, color = '#FFFFFF' }) => {
  const bodyWidth = size * 0.58;
  const bodyHeight = size * 0.55;
  const stalkWidth = size * 0.14;
  const clapper = size * 0.22;
  const earWidth = size * 0.28;
  const earHeight = size * 0.14;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Stalk / handle at top */}
      <View
        style={{
          width: stalkWidth,
          height: size * 0.12,
          borderRadius: stalkWidth / 2,
          backgroundColor: color,
          marginBottom: 0,
          marginTop: size * 0.03,
        }}
      />
      {/* Bell body — rounded top, flat bottom */}
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderTopLeftRadius: bodyWidth / 2,
          borderTopRightRadius: bodyWidth / 2,
          borderBottomLeftRadius: size * 0.04,
          borderBottomRightRadius: size * 0.04,
          backgroundColor: color,
          marginTop: -size * 0.01,
        }}
      />
      {/* Clapper (bottom circle) */}
      <View
        style={{
          width: clapper,
          height: clapper * 0.6,
          borderBottomLeftRadius: clapper / 2,
          borderBottomRightRadius: clapper / 2,
          backgroundColor: color,
          marginTop: 0,
        }}
      />
      {/* Left ear flare */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.24,
          left: size * 0.09,
          width: earWidth,
          height: earHeight,
          borderRadius: earHeight / 2,
          backgroundColor: color,
          transform: [{ rotate: '-15deg' }],
        }}
      />
      {/* Right ear flare */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.24,
          right: size * 0.09,
          width: earWidth,
          height: earHeight,
          borderRadius: earHeight / 2,
          backgroundColor: color,
          transform: [{ rotate: '15deg' }],
        }}
      />
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const NotificationButton = ({
  onPress,
  hasNotification = false,
  badgeCount,
  showBadge = false,
  iconColor = theme.Colors.white ?? '#FFFFFF',
  iconSize = 20,
  disabled = false,
  style,
}) => {
  const displayBadge = showBadge || hasNotification || (badgeCount != null && badgeCount > 0);
  const countLabel =
    badgeCount != null && badgeCount > 0
      ? badgeCount > 99
        ? '99+'
        : String(badgeCount)
      : null;

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.65}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={
        displayBadge
          ? `Notifications${countLabel ? `, ${countLabel} unread` : ', unread'}`
          : 'Notifications'
      }
      accessibilityState={{ disabled }}
      style={[styles.wrapper, style, disabled && styles.disabled]}
    >
      <BellIcon size={iconSize} color={iconColor} />

      {displayBadge && (
        <View
          style={[
            styles.badge,
            countLabel ? styles.badgeWithCount : styles.badgeDot,
          ]}
        >
          {countLabel && (
            <Text style={styles.badgeText}>{countLabel}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.Spacing?.xs ?? 4,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.Colors.status.error.badge ?? '#D0371A',  // ✅ was theme.Colors.error
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.Colors.primary ?? '#062E52',
  },
  badgeWithCount: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: theme.Colors.primary ?? '#062E52',
  },
  badgeText: {
    color: theme.Colors.white ?? '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default NotificationButton;