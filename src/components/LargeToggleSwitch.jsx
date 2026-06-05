import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FORM_FIELD_BORDER_COLOR } from '../theme/formFieldStyles';

// Fits existing FormToggleField row slot (was 90×23 pill switch).
const CONTROL_WIDTH = 90;
const CONTROL_HEIGHT = 28;
const SEGMENT_WIDTH = CONTROL_WIDTH / 2;

/** Primary active fill — shared with StatusToggle */
export const TOGGLE_ACTIVE_COLOR = '#062E52';

const DEFAULT_ACTIVE_COLOR = TOGGLE_ACTIVE_COLOR;
const SEGMENT_BORDER_COLOR = FORM_FIELD_BORDER_COLOR;

/**
 * Yes / No segmented control for workflow boolean fields.
 * OFF (false) → No selected. ON (true) → Yes selected.
 * Parent onToggle still flips boolean; segments call onToggle only when changing state.
 */
const LargeToggleSwitch = ({
  value,
  isEnabled,
  onToggle,
  disabled = false,
  activeColor = DEFAULT_ACTIVE_COLOR,
  leftLabel = 'No',
  rightLabel = 'Yes',
  style,
}) => {
  const enabled = useMemo(
    () => Boolean(isEnabled ?? value ?? false),
    [isEnabled, value],
  );

  const handleSelectNo = () => {
    if (disabled || !onToggle || !enabled) return;
    onToggle();
  };

  const handleSelectYes = () => {
    if (disabled || !onToggle || enabled) return;
    onToggle();
  };

  return (
    <View
      style={[styles.root, style, disabled && styles.disabled]}
      accessibilityRole="radiogroup"
      accessibilityLabel={enabled ? rightLabel : leftLabel}
    >
      <View style={[styles.track, { borderColor: SEGMENT_BORDER_COLOR }]}>
        <Pressable
          style={[
            styles.segment,
            styles.segmentLeft,
            !enabled && { backgroundColor: activeColor },
          ]}
          onPress={handleSelectNo}
          disabled={disabled}
          accessibilityRole="radio"
          accessibilityState={{ selected: !enabled, disabled }}
          accessibilityLabel={leftLabel}
        >
          <Text
            style={[
              styles.segmentText,
              !enabled ? styles.segmentTextActive : styles.segmentTextInactive,
              !enabled ? null : { color: activeColor },
            ]}
          >
            {leftLabel}
          </Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: SEGMENT_BORDER_COLOR }]} />

        <Pressable
          style={[
            styles.segment,
            styles.segmentRight,
            enabled && { backgroundColor: activeColor },
          ]}
          onPress={handleSelectYes}
          disabled={disabled}
          accessibilityRole="radio"
          accessibilityState={{ selected: enabled, disabled }}
          accessibilityLabel={rightLabel}
        >
          <Text
            style={[
              styles.segmentText,
              enabled ? styles.segmentTextActive : styles.segmentTextInactive,
              enabled ? null : { color: activeColor },
            ]}
          >
            {rightLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: CONTROL_WIDTH,
    height: CONTROL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  track: {
    width: CONTROL_WIDTH,
    height: CONTROL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  segment: {
    width: SEGMENT_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentLeft: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  segmentRight: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  segmentTextInactive: {
    color: DEFAULT_ACTIVE_COLOR,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
});

export default LargeToggleSwitch;
