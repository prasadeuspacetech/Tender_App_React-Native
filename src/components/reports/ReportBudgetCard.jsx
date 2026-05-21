import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#062E52';
const USED_FILL = '#1A75BF';
const TRACK = '#E5E7EB';

const LegendDot = ({ color }) => (
  <View style={[styles.legendDot, { backgroundColor: color }]} />
);

const ReportBudgetCard = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>
          How much of each department&apos;s budget has been spent
        </Text>
      </View>
      <Text style={styles.unitLabel}>₹ in Lakhs</Text>
    </View>

    <View style={styles.legendRow}>
      <View style={styles.legendItem}>
        <LegendDot color={USED_FILL} />
        <Text style={styles.legendText}>Used so far</Text>
      </View>
      <View style={styles.legendItem}>
        <LegendDot color={TRACK} />
        <Text style={styles.legendText}>Sanctioned</Text>
      </View>
    </View>

    <View style={styles.barLabelsRow}>
      <Text style={styles.barLabelPrimary}>₹9L of ₹20L</Text>
      <Text style={styles.barLabelMuted}>₹11L remaining</Text>
    </View>

    <View style={styles.track}>
      <View style={[styles.fill, { width: '45%' }]} />
    </View>

    <View style={styles.detailsBlock}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Total budget</Text>
        <Text style={styles.detailValue}>→ ₹160 Lakhs</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Total used</Text>
        <Text style={styles.detailValue}>→ ₹112 Lakhs (70%)</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 17,
  },
  unitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
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
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabelPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  barLabelMuted: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: TRACK,
    overflow: 'hidden',
    marginBottom: 14,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: USED_FILL,
  },
  detailsBlock: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
});

export default ReportBudgetCard;
