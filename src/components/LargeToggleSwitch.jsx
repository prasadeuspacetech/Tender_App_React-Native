import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Figma: large toggle track
const TRACK_WIDTH = 90;
const TRACK_HEIGHT = 23;
const TRACK_BORDER_RADIUS = 30;
const TRACK_BORDER_WIDTH = 0.5;
const TRACK_PADDING = 4;

// Figma: white pill thumb
const THUMB_WIDTH = 30;
const THUMB_HEIGHT = 15;
const THUMB_BORDER_RADIUS = 30;

const THUMB_TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_WIDTH;

/** Figma ON track — shared with StatusToggle and other toggles */
export const TOGGLE_ACTIVE_COLOR = '#062E52';

const DEFAULT_ACTIVE_COLOR = TOGGLE_ACTIVE_COLOR;
const DEFAULT_INACTIVE_COLOR = 'rgba(102, 102, 102, 0.65)';
const DEFAULT_ACTIVE_BORDER = '#558CBE';
const DEFAULT_INACTIVE_BORDER = 'rgba(102, 102, 102, 0.85)';

/**
 * Large pill toggle — Figma 104×23 track, 35×15 thumb.
 * OFF: gray track, thumb left. ON: navy track, thumb right.
 */
const LargeToggleSwitch = ({
  value,
  isEnabled,
  onToggle,
  disabled = false,
  activeColor = DEFAULT_ACTIVE_COLOR,
  inactiveColor = DEFAULT_INACTIVE_COLOR,
  style,
}) => {
  const enabled = useMemo(
    () => Boolean(isEnabled ?? value ?? false),
    [isEnabled, value],
  );

  const thumbTranslate = useRef(
    new Animated.Value(enabled ? THUMB_TRAVEL : 0),
  ).current;
  const trackAlpha = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(thumbTranslate, {
        toValue: enabled ? THUMB_TRAVEL : 0,
        useNativeDriver: true,
        bounciness: 2,
        speed: 18,
      }),
      Animated.timing(trackAlpha, {
        toValue: enabled ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [enabled, thumbTranslate, trackAlpha]);

  const trackBg = trackAlpha.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const borderColor = trackAlpha.interpolate({
    inputRange: [0, 1],
    outputRange: [DEFAULT_INACTIVE_BORDER, DEFAULT_ACTIVE_BORDER],
  });

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled }}
    >
      <View style={[styles.root, style, disabled && styles.disabled]}>
        <Animated.View
          style={[
            styles.track,
            { backgroundColor: trackBg, borderColor },
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              { transform: [{ translateX: thumbTranslate }] },
            ]}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_BORDER_RADIUS,
    borderWidth: TRACK_BORDER_WIDTH,
    padding: TRACK_PADDING,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: THUMB_BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default LargeToggleSwitch;
