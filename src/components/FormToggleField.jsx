import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import LargeToggleSwitch from './LargeToggleSwitch';
import {
  formFieldStyles,
  FORM_FIELD_PLACEHOLDER_COLOR,
} from '../theme/formFieldStyles';
import { dismissKeyboardBeforeOverlay } from '../utils/keyboardDismiss';
import { resolveToggleRowLabel } from '../utils/toggleRowLabels';

/**
 * Toggle row styled as a standard form field (matches Inputboxfield).
 * Row text reflects toggle state: rowLabelOff when OFF, rowLabelOn when ON.
 */
const FormToggleField = ({
  label,
  rowLabel,
  rowLabelOn,
  rowLabelOff,
  value = false,
  onToggle,
  disabled = false,
  required = false,
  containerStyle,
  rowStyle,
}) => {
  const statusText = resolveToggleRowLabel(value, {
    rowLabelOn,
    rowLabelOff,
    rowLabel,
    label,
  });
  const showHeaderLabel = Boolean(
    label && (rowLabelOn ?? rowLabel) && label !== (rowLabelOn ?? rowLabel),
  );

  const handleToggle = useCallback(() => {
    if (disabled || !onToggle) return;
    dismissKeyboardBeforeOverlay();
    onToggle();
  }, [disabled, onToggle]);

  return (
    <View style={[formFieldStyles.container, containerStyle]}>
      {showHeaderLabel ? (
        <Text style={formFieldStyles.label}>
          {label}
          {required ? <Text style={formFieldStyles.required}> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        onPress={handleToggle}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={statusText}
        style={({ pressed }) => [
          formFieldStyles.control,
          formFieldStyles.toggleControl,
          disabled && formFieldStyles.controlDisabled,
          pressed && !disabled && { opacity: 0.92 },
          rowStyle,
        ]}
      >
        <Text
          style={[
            formFieldStyles.controlText,
            formFieldStyles.toggleLabel,
            { color: FORM_FIELD_PLACEHOLDER_COLOR, fontWeight: '400' },
          ]}
        >
          {statusText}
          {!showHeaderLabel && required ? (
            <Text style={formFieldStyles.required}> *</Text>
          ) : null}
        </Text>

        <View style={formFieldStyles.toggleSwitchSlot} pointerEvents="box-none">
          <LargeToggleSwitch
            value={value}
            onToggle={handleToggle}
            disabled={disabled}
          />
        </View>
      </Pressable>
    </View>
  );
};

export default FormToggleField;
