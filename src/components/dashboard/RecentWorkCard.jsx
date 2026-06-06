import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStatusLabel } from '../../i18n/statusLabels';
import { dashboardCardBorderStyle } from './dashboardCardBorder';

const STATUS_COLORS = {
  completed: '#2F5E34',
  pending: '#8B2513',
  progress: '#FF5D00',
};

const RecentWorkCard = ({
  title,
  code = 'Code',
  status = 'pending',
  iconName = 'construct-outline',
  style,
}) => {
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  const statusLabel = useStatusLabel(status);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={20} color="#374151" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.code} numberOfLines={1}>
          {code}
        </Text>
      </View>

      <Text style={[styles.status, { color: statusColor }]}>
        {statusLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...dashboardCardBorderStyle,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
    marginBottom: 2,
  },
  code: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RecentWorkCard;
