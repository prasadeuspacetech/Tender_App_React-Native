import React, { useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

const CATEGORIES = ['All', 'Road Repair', 'Drainage', 'Parks', 'School', 'Water'];

const PRIMARY = '#062E52';

/**
 * Horizontal category chips — UI only (selection is local visual state).
 */
const ReportCategoryChipRow = ({ style }) => {
  const [selected, setSelected] = useState('All');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      {CATEGORIES.map((label) => {
        const isSelected = selected === label;
        return (
          <Pressable
            key={label}
            onPress={() => setSelected(label)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ReportCategoryChipRow;
