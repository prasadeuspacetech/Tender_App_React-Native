import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FieldHelpTooltip from './FieldHelpTooltip';
import {
  FORM_FIELD_LABEL_MARGIN_BOTTOM,
  formFieldStyles,
} from '../../theme/formFieldStyles';

/**
 * Standard label row: text + optional help icon + required asterisk.
 * Pass `helpKey` (help namespace) or legacy `helpText` override.
 */
const FormFieldLabel = ({
  label,
  helpKey,
  helpText,
  helpTooltipId,
  required = false,
  style,
  labelStyle,
}) => {
  const hasHelp = Boolean(helpKey || helpText?.trim());

  if (!label && !hasHelp) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      {label ? (
        <Text style={[formFieldStyles.label, styles.label, labelStyle]} numberOfLines={2}>
          {label}
          {required ? <Text style={formFieldStyles.required}> *</Text> : null}
        </Text>
      ) : (
        <View style={styles.labelSpacer} />
      )}

      {hasHelp ? (
        <FieldHelpTooltip
          helpKey={helpKey}
          text={helpText}
          fieldLabel={label}
          tooltipId={helpTooltipId}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: FORM_FIELD_LABEL_MARGIN_BOTTOM,
  },
  label: {
    flexShrink: 1,
    marginBottom: 0,
  },
  labelSpacer: {
    flex: 1,
  },
});

export default FormFieldLabel;
