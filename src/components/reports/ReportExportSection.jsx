import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ExportCard = ({ iconName, title }) => (
  <Pressable style={styles.exportCard} accessibilityRole="button" accessibilityLabel={title}>
    <View style={styles.exportIconWrap}>
      <Ionicons name={iconName} size={28} color="#062E52" />
    </View>
    <Text style={styles.exportTitle}>{title}</Text>
  </Pressable>
);

const ReportExportSection = ({ style }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>Export Report</Text>
    <View style={styles.row}>
      <ExportCard iconName="document-text-outline" title="Export PDF" />
      <View style={styles.gap} />
      <ExportCard iconName="grid-outline" title="Export Excel" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  gap: {
    width: 12,
  },
  exportCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  exportIconWrap: {
    marginBottom: 10,
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});

export default ReportExportSection;
