// Settings — includes language picker (Phase 2 i18n)

import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import LanguagePicker from '../../components/LanguagePicker';
import FinancialYearBudgetSection from '../../components/settings/FinancialYearBudgetSection';
import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import SettingsDrawer from '../../components/Settingsdrawer';
import { resetToActivation } from '../../navigation/navigationRef';
import { isSubscriptionExpired } from '../../services/subscriptionService';
import useAuthStore from '../../store/useAuthStore';
import {
  formatSubscriptionExpiryDate,
  getSubscriptionTimeLeftText,
} from '../../utils/subscriptionDisplay';
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
  const { t, i18n } = useTranslation('settings');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActivated = useAuthStore((state) => state.isActivated);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const clearSession = useAuthStore((state) => state.clearSession);

  const subscriptionSubtitle = useMemo(() => {
    if (!isActivated || !expiresAt) {
      return t('subscription.inactive');
    }

    const expired = isSubscriptionExpired(expiresAt);
    const dateLabel = formatSubscriptionExpiryDate(
      expiresAt,
      i18n.language === 'mr' ? 'mr-IN' : 'en-IN',
    );
    const timeLeft = getSubscriptionTimeLeftText(expiresAt);

    if (expired) {
      return t('subscription.expiredOn', { date: dateLabel });
    }

    if (timeLeft) {
      return `${t('subscription.active')} · ${t('subscription.timeLeft', { time: timeLeft })}`;
    }

    return `${t('subscription.active')} · ${t('subscription.expiresOn', { date: dateLabel })}`;
  }, [isActivated, expiresAt, i18n.language, t]);

  const handleLogout = () => {
    Alert.alert(t('logout.confirmTitle'), t('logout.confirmMessage'), [
      { text: t('logout.cancel'), style: 'cancel' },
      {
        text: t('logout.confirmButton'),
        style: 'destructive',
        onPress: () => {
          clearSession();
          resetToActivation();
        },
      },
    ]);
  };

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
            subtitle={subscriptionSubtitle}
            leftIcon={
              <Ionicons name="star-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
          <NavigationCard
            title={t('logout.title')}
            subtitle={t('logout.subtitle')}
            onPress={handleLogout}
            leftIcon={
              <Ionicons name="log-out-outline" size={ICON_SIZE} color={ICON_COLOR} />
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
});

export default SettingsScreen;
