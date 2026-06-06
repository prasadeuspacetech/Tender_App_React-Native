import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../theme';
import { getStatusLabel, useStatusLabel } from '../i18n/statusLabels';

// Figma Work List status chips — shared by filters + card badges
const CHIP_WIDTH = 112;
const CHIP_HEIGHT = 30;

const STATUS_CONFIG = {
  all: { color: '#555555' },
  pending: { color: '#8B2513' },
  progress: { color: '#FF5D00' },
  completed: { color: '#2F5E34' },
};

const StatusChip = ({
  label,
  status = 'pending',
  selected = false,
  onPress,
  style,
  disabled = false,
  compact = false,
}) => {
  const { t } = useTranslation('common');
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const translatedLabel = useStatusLabel(status);
  const displayLabel = label ?? translatedLabel;
  const isInteractive = typeof onPress === 'function' && !disabled;

  const chipStyle = [
    compact ? styles.chipCompact : styles.chip,
    selected && styles.chipSelected,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    compact ? styles.labelCompact : styles.label,
    { color: config.color },
    selected && styles.labelSelected,
  ];

  const content = <Text style={labelStyle} numberOfLines={1}>{displayLabel}</Text>;

  if (isInteractive) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={t('status.statusAccessibility', { label: displayLabel })}
        style={chipStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={chipStyle}
      accessibilityRole="text"
      accessibilityLabel={t('status.statusLabel', { label: displayLabel })}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#999999',
    backgroundColor: '#F1EFEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  chipCompact: {
    flex: 1,
    minWidth: 0,
    height: CHIP_HEIGHT,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#999999',
    backgroundColor: '#F1EFEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  chipSelected: {
    borderColor: '#333333',
    borderWidth: 1.2,
  },
  label: {
    fontFamily: theme.FontFamily?.regular ?? 'Roboto',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 1.05,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  labelCompact: {
    fontFamily: theme.FontFamily?.regular ?? 'Roboto',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  labelSelected: {
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.45,
  },
});

export const workCompletedToChipStatus = (workCompleted) => {
  if (workCompleted === 'Completed') return 'completed';
  if (workCompleted === 'In Progress') return 'progress';
  return 'pending';
};

export const workCompletedToChipLabel = (workCompleted) => {
  const status = workCompletedToChipStatus(workCompleted);
  return getStatusLabel(status);
};

export default StatusChip;
