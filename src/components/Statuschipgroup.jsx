import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatusChip from './Statuschip';
import theme from '../theme';

const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'progress', label: 'Progress' },
  { key: 'completed', label: 'Completed' },
];

const StatusChipGroup = ({
  selectedStatus = 'all',
  onChange,
  style,
}) => {
  const handlePress = (key) => {
    if (typeof onChange === 'function') {
      onChange(key);
    }
  };

  return (
    <View style={[styles.row, style]}>
      {FILTER_CHIPS.map((chip, index) => (
        <View
          key={chip.key}
          style={[
            styles.chipCell,
            index < FILTER_CHIPS.length - 1 && styles.chipGap,
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
