import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { dashboardCardSurfaceStyle } from '../dashboard/dashboardCardBorder';

const ReportShareCard = ({ style }) => {
  const { t } = useTranslation('reports');

  return (
    <Pressable
      style={[styles.card, style]}
      accessibilityRole="button"
      accessibilityLabel={t('share.accessibility')}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="share-social-outline" size={22} color="#062E52" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{t('share.title')}</Text>
        <Text style={styles.subtitle}>{t('share.subtitle')}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...dashboardCardSurfaceStyle,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF5FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default ReportShareCard;
