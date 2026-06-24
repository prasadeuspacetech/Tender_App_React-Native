import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './help/FormFieldLabel';
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
  helpKey,
  helpText,
  helpTooltipId,
  containerStyle,
  rowStyle,
  segmentLeftLabel,
  segmentRightLabel,
}) => {
  const { t } = useTranslation('workflow');
  const leftSegment = segmentLeftLabel ?? t('toggles.no');
  const rightSegment = segmentRightLabel ?? t('toggles.yes');
  const statusText = resolveToggleRowLabel(value, {
    rowLabelOn,
    rowLabelOff,
    rowLabel,
    label,
  });
  const hasHelp = Boolean(helpKey || helpText?.trim());
  const showHeaderLabel = Boolean(
    label && (rowLabelOn ?? rowLabel) && label !== (rowLabelOn ?? rowLabel),
  );
  const showHelpOnly = hasHelp && !showHeaderLabel;

  const handleToggle = useCallback(() => {
    if (disabled || !onToggle) return;
    dismissKeyboardBeforeOverlay();
    onToggle();
  }, [disabled, onToggle]);

  return (
    <View style={[formFieldStyles.container, containerStyle]}>
      {showHeaderLabel || showHelpOnly ? (
        <FormFieldLabel
          label={showHeaderLabel ? label : undefined}
          required={showHeaderLabel ? required : false}
          helpKey={helpKey}
          helpText={helpText}
          helpTooltipId={helpTooltipId}
        />
      ) : null}

      <Pressable
        onPress={handleToggle}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={statusText}
        style={({ pressed }) => [
          formFieldStyles.controlShell,
          formFieldStyles.toggleControl,
          disabled && formFieldStyles.controlDisabled,
          pressed && !disabled && { opacity: 0.92 },
          rowStyle,
        ]}
      >
        <View style={formFieldStyles.toggleLabelWrap}>
          <Text
            style={[
              formFieldStyles.toggleLabel,
              { color: FORM_FIELD_PLACEHOLDER_COLOR, fontWeight: '400' },
            ]}
          >
            {statusText}
            {!showHeaderLabel && required ? (
              <Text style={formFieldStyles.required}> *</Text>
            ) : null}
          </Text>
        </View>

        <View style={formFieldStyles.toggleSwitchSlot} pointerEvents="box-none">
          <LargeToggleSwitch
            value={value}
            onToggle={handleToggle}
            disabled={disabled}
            leftLabel={leftSegment}
            rightLabel={rightSegment}
          />
        </View>
      </Pressable>
    </View>
  );
};

export default FormToggleField;
