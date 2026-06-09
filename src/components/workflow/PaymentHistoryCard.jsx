import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import theme from '../../theme';
import { parseStoredDate } from '../../utils/dateFormat';
import FormFieldLabel from '../help/FormFieldLabel';

const TEXT = theme.Colors?.text ?? '#1A1A1A';
const SECONDARY = theme.Colors?.secondary ?? '#777777';
const BORDER = theme.Colors?.border ?? '#E0E0E0';
const WHITE = theme.Colors?.white ?? '#FFFFFF';
const PAID = '#1D6B43';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatPaymentDate = (storedDate) => {
  const d = parseStoredDate(storedDate);
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatRupee = (amount) => {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const PaymentHistoryCard = ({ installments = [], style }) => {
  const { t } = useTranslation('workflow');

  if (!installments || installments.length === 0) return null;

  return (
    <View style={[styles.card, style]}>
      <FormFieldLabel
        label={t('payment.historyHeading')}
        helpKey="workflow.paymentStatus.paymentHistory"
        helpTooltipId="paymentStatus-paymentHistory"
        labelStyle={styles.heading}
        style={styles.headingRow}
      />

      {installments.map((row, index) => (
        <View
          key={row.id ?? `${row.payment_date}-${index}`}
          style={[styles.row, index < installments.length - 1 && styles.rowDivider]}
        >
          <Text style={styles.amount}>{formatRupee(row.amount_paid)}</Text>
          <Text style={styles.date}>
            {t('payment.paidOn', { date: formatPaymentDate(row.payment_date) })}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: theme.Radius?.md ?? 10,
    backgroundColor: WHITE,
    paddingVertical: theme.Spacing?.sm ?? 10,
    paddingHorizontal: theme.Spacing?.md ?? 14,
    marginTop: theme.Spacing?.md ?? 14,
  },
  headingRow: {
    marginBottom: theme.Spacing?.xs ?? 8,
  },
  heading: {
    fontSize: theme.FontSize?.md ?? 14,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 0,
  },
  row: {
    paddingVertical: theme.Spacing?.sm ?? 10,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  amount: {
    fontSize: theme.FontSize?.md ?? 15,
    fontWeight: '700',
    color: PAID,
  },
  date: {
    marginTop: 2,
    fontSize: theme.FontSize?.xs ?? 12,
    color: SECONDARY,
  },
});

export default PaymentHistoryCard;
