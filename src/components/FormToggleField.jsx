import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LargeToggleSwitch from './LargeToggleSwitch';
import {
  formFieldStyles,
  FORM_FIELD_PLACEHOLDER_COLOR,
} from '../theme/formFieldStyles';

/**
 * Toggle row styled as a standard form field (matches Inputboxfield).
 * Switch is vertically centered on the right for all workflow screens.
 */
const FormToggleField = ({
  label,
  rowLabel,
  value = false,
  onToggle,
  disabled = false,
  required = false,
  containerStyle,
  rowStyle,
}) => {
  const innerLabel = rowLabel ?? label;
  const showHeaderLabel = label && rowLabel && label !== rowLabel;

  const handleToggle = () => {
    if (!disabled && onToggle) onToggle();
  };

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
        accessibilityLabel={innerLabel}
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
          numberOfLines={1}
        >
          {innerLabel}
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
