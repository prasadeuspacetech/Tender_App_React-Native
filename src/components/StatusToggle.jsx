import React, { useRef, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import theme from '../theme';
import { TOGGLE_ACTIVE_COLOR } from './LargeToggleSwitch';

const TRACK_WIDTH = 100;
const TRACK_OFF_COLOR = '#D9D9D9';
const TRACK_HEIGHT = 30;
const PILL_WIDTH = TRACK_WIDTH / 2;      // 50px per slot
const PILL_HEIGHT = TRACK_HEIGHT - 4;    // 26px inner pill
const PILL_TRAVEL = TRACK_WIDTH / 2;     // slide to right for "open"

const StatusToggle = ({
  status = 'closed',
  onToggle,
  disabled = false,
  style,
  openLabel = 'Open',
  closedLabel = 'Closed',
  activeColor = TOGGLE_ACTIVE_COLOR,
}) => {
  const isOpen = status === 'open';

  const pillTranslate = useRef(new Animated.Value(isOpen ? PILL_TRAVEL : 0)).current;
  const trackBg = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillTranslate, {
        toValue: isOpen ? PILL_TRAVEL : 0,
        useNativeDriver: true,
        bounciness: 3,
        speed: 14,
      }),
      Animated.timing(trackBg, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOpen]);

  const interpolatedTrack = trackBg.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_OFF_COLOR, activeColor],
  });

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onToggle}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`Status: ${status}. Tap to toggle.`}
    >
      <View style={[styles.wrapper, style, disabled && styles.disabled]}>
        <Animated.View style={[styles.track, { backgroundColor: interpolatedTrack }]}>
          {/* Static label: Closed (left) */}
          <View style={[styles.labelSlot, styles.leftSlot]}>
            <Text style={[styles.label, isOpen && styles.labelFaded]}>
              {closedLabel}
            </Text>
          </View>

          {/* Static label: Open (right) */}
          <View style={[styles.labelSlot, styles.rightSlot]}>
            <Text style={[styles.label, !isOpen && styles.labelFaded]}>
              {openLabel}
            </Text>
          </View>

          {/* Sliding active pill */}
          <Animated.View
            style={[styles.pill, { transform: [{ translateX: pillTranslate }] }]}
          >
            <Text style={styles.pillLabel}>
              {isOpen ? openLabel : closedLabel}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: theme.Radius?.full ?? 40,                      // ✅ was theme.borderRadius.full
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  labelSlot: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  leftSlot: {
    left: 2,
  },
  rightSlot: {
    right: 2,
  },
  label: {
    fontSize: theme.FontSize?.xs ?? 11,                          // ✅ was theme.typography?.sizes?.xs
    fontWeight: theme.FontWeight?.medium ?? '500',               // ✅ was theme.typography?.weights?.medium
    color: theme.Colors.white ?? '#FFFFFF',                      // ✅ was theme.colors.white
    letterSpacing: 0.2,
  },
  labelFaded: {
    opacity: 0,
  },
  pill: {
    width: PILL_WIDTH - 4,
    height: PILL_HEIGHT,
    borderRadius: theme.Radius?.full ?? 40,                      // ✅ was theme.borderRadius.full
    backgroundColor: theme.Colors.white ?? '#FFFFFF',            // ✅ was theme.colors.white
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 2,
    ...theme.Shadow?.sm,                                         // ✅ was theme.shadows?.sm
  },
  pillLabel: {
    fontSize: theme.FontSize?.xs ?? 11,                          // ✅ was theme.typography?.sizes?.xs
    fontWeight: theme.FontWeight?.semiBold ?? '600',             // ✅ was theme.typography?.weights?.semibold
    color: theme.Colors.textPrimary ?? '#000000',                // ✅ was theme.colors.textPrimary
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default StatusToggle;