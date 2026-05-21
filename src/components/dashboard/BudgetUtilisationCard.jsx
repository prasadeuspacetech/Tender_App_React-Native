import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#062E52';

const BudgetUtilisationCard = ({ percent = 65, title = 'Budget Utilisation', style }) => {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${clamped}%` }]} />
        </View>
        <Text style={styles.percent}>{clamped}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginRight: 10,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  percent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    minWidth: 36,
    textAlign: 'right',
  },
});

export default BudgetUtilisationCard;
