// src/screens/Settings/SettingsScreen.jsx
// Static Settings UI — Figma layout (no handlers / logic)

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../theme';

const ICON_COLOR = '#555555';
const ICON_SIZE = 22;

const SettingsSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCards}>{children}</View>
  </View>
);

const SubscriptionSubtitle = () => (
  <Text style={styles.subtitleLine}>
    <Text style={styles.subtitleActive}>Active</Text>
    <Text style={styles.subtitleRest}> · Expires Jun 2026</Text>
  </Text>
);

const SettingsScreen = () => {
  return (
    <ScreenLayout
      showMenu
      showNotification
      scrollable
      title="Setting"
      headerTitleStyle={styles.heroTitle}
      contentStyle={styles.scrollContent}
    >
      <SettingsSection title="Data Management">
        <NavigationCard
          interactive={false}
          title="Backup Data"
          subtitle="Export all works as JSON"
          leftIcon={
            <Ionicons name="cloud-upload-outline" size={ICON_SIZE} color={ICON_COLOR} />
          }
        />
        <NavigationCard
          interactive={false}
          title="Restore Data"
          subtitle="Import from backup file"
          leftIcon={
            <Ionicons name="cloud-download-outline" size={ICON_SIZE} color={ICON_COLOR} />
          }
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <NavigationCard
          interactive={false}
          title="Subscription Status"
          subtitle={<SubscriptionSubtitle />}
          leftIcon={
            <Ionicons name="star-outline" size={ICON_SIZE} color={ICON_COLOR} />
          }
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <NavigationCard
          interactive={false}
          title="Help & Guide"
          subtitle="App usage instructions"
          leftIcon={
            <Ionicons name="help-circle-outline" size={ICON_SIZE} color={ICON_COLOR} />
          }
        />
      </SettingsSection>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xxl,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary ?? '#666666',
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  sectionCards: {
    marginTop: 2,
  },
  subtitleLine: {
    marginTop: 2,
    fontSize: FontSize.xs ?? 12,
    lineHeight: 16,
  },
  subtitleActive: {
    color: '#1D6B43',
    fontWeight: FontWeight.medium,
  },
  subtitleRest: {
    color: Colors.textSecondary ?? '#666666',
    fontWeight: FontWeight.regular,
  },
});

export default SettingsScreen;
