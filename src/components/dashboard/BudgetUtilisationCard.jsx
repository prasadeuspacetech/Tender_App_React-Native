import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatRupeesFull } from '../../utils/currencyFormat';
import { dashboardCardSurfaceStyle } from './dashboardCardBorder';
import { dashboardSectionLabelStyle } from './dashboardTypography';

const PRIMARY = '#062E52';
const TRACK = '#E5E7EB';
const PROGRESS_BAR_HEIGHT = 20;
const PROGRESS_BAR_RADIUS = 10;

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const BudgetUtilisationCard = ({
  percent = 0,
  title = 'Budget Utilisation',
  workCountLabel = 'Total Work Count',
  totalBudgetLabel = 'Total Budget',
  totalSpendLabel = 'Total Spend',
  workCount = 0,
  totalBudget = 0,
  totalSpend = 0,
  style,
}) => {
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

      <View style={styles.details}>
        <DetailRow label={workCountLabel} value={String(workCount)} />
        <DetailRow label={totalBudgetLabel} value={formatRupeesFull(totalBudget)} />
        <DetailRow label={totalSpendLabel} value={formatRupeesFull(totalSpend)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    ...dashboardCardSurfaceStyle,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  title: {
    ...dashboardSectionLabelStyle,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  track: {
    flex: 1,
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_RADIUS,
    backgroundColor: TRACK,
    overflow: 'hidden',
    marginRight: 8,
    maxWidth: 300,
  },
  fill: {
    height: '100%',
    borderRadius: PROGRESS_BAR_RADIUS,
    backgroundColor: PRIMARY,
  },
  percent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 38,
    textAlign: 'right',
    lineHeight: 16,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
  },
});

export default BudgetUtilisationCard;
