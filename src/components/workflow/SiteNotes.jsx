import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FormFieldLabel from '../help/FormFieldLabel';
import { MAX_SITE_NOTES_LENGTH } from '../../db/repositories/workProgressRepository';

/**
 * Site notes field — controlled component with live character counter.
 */
const SiteNotes = ({
  value = '',
  onChangeText,
  style,
  helpKey,
  helpText,
  helpTooltipId,
}) => {
  const { t } = useTranslation('workflow');
  const length = String(value ?? '').length;
  const displayCount = Math.min(length, MAX_SITE_NOTES_LENGTH);

  const handleChange = (text) => {
    if (text.length <= MAX_SITE_NOTES_LENGTH) {
      onChangeText?.(text);
    } else {
      onChangeText?.(text.slice(0, MAX_SITE_NOTES_LENGTH));
    }
  };

  return (
    <View style={[styles.section, style]}>
      <FormFieldLabel
        label={t('site.notes')}
        helpKey={helpKey}
        helpText={helpText}
        helpTooltipId={helpTooltipId}
        labelStyle={styles.label}
        style={styles.labelRow}
      />

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={t('site.notesPlaceholder')}
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          multiline
          textAlignVertical="top"
          accessibilityLabel={t('site.notesAccessibility')}
        />
      </View>

      <Text style={styles.counter}>
        {displayCount} / {MAX_SITE_NOTES_LENGTH}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: -15,
    marginBottom: 10,
  },
  labelRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 18,
    marginBottom: 0,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    minHeight: 148,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    minHeight: 120,
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.85)',
    lineHeight: 22,
    padding: 0,
    margin: 0,
  },
  counter: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 16,
  },
});

export default SiteNotes;
