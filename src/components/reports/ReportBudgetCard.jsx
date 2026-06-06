import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { dashboardCardSurfaceStyle } from '../dashboard/dashboardCardBorder';

const PRIMARY = '#062E52';
const GRADIENT_END = '#0D67B8';
const LEGEND_USED = '#0D67B8';
const LEGEND_SANCTIONED = 'rgba(0, 0, 0, 0.14)';
const TRACK_BG = 'rgba(0, 0, 0, 0.14)';

const BAR_HEIGHT = 15;
const BAR_RADIUS = 40;
const CARD_RADIUS = 15;

const LegendDot = ({ color }) => (
  <View style={[styles.legendDot, { backgroundColor: color }]} />
);

const ReportBudgetCard = ({
  barPrimaryLabel = '₹0 of ₹0',
  barRemainingLabel = '₹0 remaining',
  totalBudgetDetail = '→ ₹0',
  totalUsedDetail = '→ ₹0 (0%)',
  progressPercent = 0,
  style,
}) => {
  const { t } = useTranslation('reports');
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const fillWidth = `${clamped}%`;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('budget.title')}</Text>
          <Text style={styles.subtitle}>{t('budget.subtitle')}</Text>
        </View>
        <Text style={styles.unitLabel}>{t('budget.unitLabel')}</Text>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <LegendDot color={LEGEND_USED} />
          <Text style={styles.legendText}>{t('budget.usedSoFar')}</Text>
        </View>
        <View style={styles.legendItem}>
          <LegendDot color={LEGEND_SANCTIONED} />
          <Text style={styles.legendText}>{t('budget.sanctioned')}</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <Text style={styles.barLabelPrimary}>{barPrimaryLabel}</Text>

        <View style={styles.track}>
          {clamped > 0 ? (
            <View style={[styles.fillClip, { width: fillWidth }]}>
              <LinearGradient
                colors={[PRIMARY, GRADIENT_END]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.fillGradient}
              />
            </View>
          ) : null}
        </View>

        <Text style={styles.barLabelRemaining}>{barRemainingLabel}</Text>
      </View>

      <View style={styles.detailsBlock}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('budget.totalBudget')}</Text>
          <Text style={styles.detailValue}>{totalBudgetDetail}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('budget.totalUsed')}</Text>
          <Text style={styles.detailValue}>{totalUsedDetail}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    ...dashboardCardSurfaceStyle,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 16,
  },
  unitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
    lineHeight: 16,
    paddingTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 16,
  },
  progressBlock: {
    marginBottom: 12,
  },
  barLabelPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B2513',
    textAlign: 'right',
    lineHeight: 18,
    marginBottom: 6,
  },
  track: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    backgroundColor: TRACK_BG,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fillClip: {
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    minWidth: 0,
  },
  fillGradient: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
  },
  barLabelRemaining: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 16,
    marginTop: 6,
  },
  detailsBlock: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
    lineHeight: 18,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
});

export default ReportBudgetCard;
