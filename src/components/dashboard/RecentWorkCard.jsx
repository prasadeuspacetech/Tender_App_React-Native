import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const STATUS_STYLES = {
  completed: { label: 'Completed', color: '#2F5E34' },
  pending: { label: 'Pending', color: '#8B2513' },
  progress: { label: 'Progress', color: '#FF5D00' },
};

const RecentWorkCard = ({
  title,
  code = 'Code',
  status = 'pending',
  iconName = 'construct-outline',
  style,
}) => {
  const statusConfig = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

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

      <Text style={[styles.status, { color: statusConfig.color }]}>
        {statusConfig.label}
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
