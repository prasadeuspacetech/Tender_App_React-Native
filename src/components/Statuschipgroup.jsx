import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import StatusChip from './Statuschip';
import theme from '../theme';

const FILTER_CHIP_KEYS = ['all', 'pending', 'progress', 'completed'];

const StatusChipGroup = ({
  selectedStatus = 'all',
  onChange,
  style,
}) => {
  const { t } = useTranslation('common');

  const filterChips = useMemo(
    () => FILTER_CHIP_KEYS.map((key) => ({ key, label: t(`status.${key}`) })),
    [t],
  );

  const handlePress = (key) => {
    if (typeof onChange === 'function') {
      onChange(key);
    }
  };

  return (
    <View style={[styles.row, style]}>
      {filterChips.map((chip, index) => (
        <View
          key={chip.key}
          style={[
            styles.chipCell,
            index < filterChips.length - 1 && styles.chipGap,
          ]}
        >
          <StatusChip
            label={chip.label}
            status={chip.key}
            compact
            selected={selectedStatus === chip.key}
            onPress={() => handlePress(chip.key)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.Spacing?.md ?? 16,
    paddingVertical: theme.Spacing?.sm ?? 8,
  },
  chipCell: {
    flex: 1,
    minWidth: 0,
  },
  chipGap: {
    marginRight: 6,
  },
});

export default StatusChipGroup;
