import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ReportShareCard = ({ style }) => (
  <Pressable
    style={[styles.card, style]}
    accessibilityRole="button"
    accessibilityLabel="Share via WhatsApp or Email"
  >
    <View style={styles.iconCircle}>
      <Ionicons name="share-social-outline" size={22} color="#062E52" />
    </View>

    <View style={styles.body}>
      <Text style={styles.title}>Share via WhatsApp / Email</Text>
      <Text style={styles.subtitle}>Send report directly to stakeholders</Text>
    </View>

    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
