import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropdownModal from '../DropdownModal';

const DEFAULT_OPTIONS = [
  { label: 'FY 2025-26', value: '2025-26' },
  { label: 'FY 2024-25', value: '2024-25' },
  { label: 'FY 2023-24', value: '2023-24' },
];

const FinancialYearDropdown = ({
  value = '2025-26',
  onChange,
  options = DEFAULT_OPTIONS,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed, style]}
        accessibilityRole="button"
        accessibilityLabel={`Financial year ${selected.label}`}
      >
        <Text style={styles.label} numberOfLines={1}>
          {selected.label}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#FFFFFF" style={styles.chevron} />
      </Pressable>

      <DropdownModal
        visible={open}
        title="Financial Year"
        options={options}
        selectedValue={value}
        onSelect={(option) => {
          onChange?.(option.value);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingLeft: 12,
    paddingRight: 8,
    maxWidth: 130,
  },
  pillPressed: {
    opacity: 0.88,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chevron: {
    marginLeft: 4,
  },
});

export default FinancialYearDropdown;
