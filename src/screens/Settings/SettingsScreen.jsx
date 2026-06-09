// Settings — includes language picker (Phase 2 i18n)

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import LanguagePicker from '../../components/LanguagePicker';
import FinancialYearBudgetSection from '../../components/settings/FinancialYearBudgetSection';
import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import SettingsDrawer from '../../components/Settingsdrawer';
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

const SettingsScreen = () => {
  const { t } = useTranslation('settings');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const SubscriptionSubtitle = () => (
    <Text style={styles.subtitleLine}>
      <Text style={styles.subtitleActive}>{t('subscription.active')}</Text>
      <Text style={styles.subtitleRest}>{` · ${t('subscription.expires')}`}</Text>
    </Text>
  );

  return (
    <>
      <ScreenLayout
        showMenu
        showNotification
        scrollable
        title={t('title')}
        headerTitleStyle={styles.heroTitle}
        contentStyle={styles.scrollContent}
        onMenuPress={() => setDrawerOpen(true)}
      >
        <SettingsSection title={t('sections.language')}>
          <Text style={styles.languageHint}>{t('language.subtitle')}</Text>
          <LanguagePicker />
        </SettingsSection>
        
        <View style={styles.sectionDivider} />

        <SettingsSection title={t('sections.financialYearBudget')}>
          <FinancialYearBudgetSection />
        </SettingsSection>

        <View style={styles.sectionDivider} />

        <SettingsSection title={t('sections.dataManagement')}>
          <NavigationCard
            interactive={false}
            title={t('backup.title')}
            subtitle={t('backup.subtitle')}
            leftIcon={
              <Ionicons name="cloud-upload-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
          <NavigationCard
            interactive={false}
            title={t('restore.title')}
            subtitle={t('restore.subtitle')}
            leftIcon={
              <Ionicons name="cloud-download-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
        </SettingsSection>

        <SettingsSection title={t('sections.account')}>
          <NavigationCard
            interactive={false}
            title={t('subscription.title')}
            subtitle={<SubscriptionSubtitle />}
            leftIcon={
              <Ionicons name="star-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
        </SettingsSection>

        <SettingsSection title={t('sections.support')}>
          <NavigationCard
            interactive={false}
            title={t('help.title')}
            subtitle={t('help.subtitle')}
            leftIcon={
              <Ionicons name="help-circle-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
        </SettingsSection>
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: 18,
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
    fontSize: FontSize.base,
    fontWeight: 500,
    color: 'black',
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  sectionCards: {},
  languageHint: {
    fontSize: FontSize.sm ?? 13,
    color: Colors.textSecondary ?? '#666666',
    marginBottom: Spacing.sm,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderDefault ?? '#E4E4E4',
    marginBottom: Spacing.lg,
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
