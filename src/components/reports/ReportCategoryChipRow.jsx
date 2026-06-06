import React, { useMemo, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const PRIMARY = '#062E52';

const CATEGORY_KEYS = [
  'all',
  'roadRepair',
  'drainage',
  'parks',
  'school',
  'water',
];

/**
 * Horizontal category chips — UI only (selection is local visual state).
 */
const ReportCategoryChipRow = ({ style }) => {
  const { t } = useTranslation('reports');
  const [selected, setSelected] = useState('all');

  const categories = useMemo(
    () =>
      CATEGORY_KEYS.map((key) => ({
        key,
        label: t(`categories.${key}`),
      })),
    [t],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      {categories.map((item) => {
        const isSelected = selected === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => setSelected(item.key)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 1,
    paddingRight: 4,
    paddingLeft: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    marginLeft: 6,
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
