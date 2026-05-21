import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ReportStatCard = ({ value, title, subtitle, style }) => (
  <View style={[styles.card, style]}>
    <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
      {value}
    </Text>
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
    <Text style={styles.subtitle} numberOfLines={2}>
      {subtitle}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 15,
  },
});

export default ReportStatCard;
