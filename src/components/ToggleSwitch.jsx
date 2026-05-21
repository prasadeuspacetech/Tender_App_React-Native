import React, { useRef, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import theme from '../theme';

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 20;
const THUMB_SIZE = 15;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - (TRACK_HEIGHT - THUMB_SIZE); // ~31

const ToggleSwitch = ({ value = false, onToggle, disabled = false, style }) => {
  const translateX = useRef(new Animated.Value(value ? THUMB_TRAVEL : 0)).current;
  const trackColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? THUMB_TRAVEL : 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }),
      Animated.timing(trackColor, {
        toValue: value ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const interpolatedTrack = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.Colors.borderDefault ?? '#D9D9D9', theme.Colors.primary], // ✅ was theme.colors.border / theme.colors.primary
  });

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={[styles.wrapper, style, disabled && styles.disabled]}>
        <Animated.View style={[styles.track, { backgroundColor: interpolatedTrack }]}>
          <Animated.View
            style={[styles.thumb, { transform: [{ translateX }] }]}
          />
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
    borderRadius: theme.Radius?.full ?? 25,                      // ✅ was theme.borderRadius.full
    justifyContent: 'center',
    paddingHorizontal: (TRACK_HEIGHT - THUMB_SIZE) / 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: theme.Colors.white ?? '#FFFFFF',            // ✅ was theme.colors.white
    ...theme.Shadow?.sm,                                         // ✅ was theme.shadows?.sm
  },
  disabled: {
    opacity: 0.45,
  },
});

export default ToggleSwitch;