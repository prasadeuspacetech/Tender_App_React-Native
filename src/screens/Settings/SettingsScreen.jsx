// Settings — includes language picker (Phase 2 i18n)

import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

import LanguagePicker from '../../components/LanguagePicker';
import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import BackupProgressModal from '../../components/settings/BackupProgressModal';
import FinancialYearBudgetSection from '../../components/settings/FinancialYearBudgetSection';
import SettingsDrawer from '../../components/Settingsdrawer';
import {
    createBackupArchive,
    getBackupExportPreview,
    shareBackupArchive,
} from '../../services/backup/backupExportService';
import { cleanupDirectory } from '../../services/backup/backupFileUtils';
import {
    importInspectedBackupArchive,
    inspectBackupArchiveFile,
    pickBackupArchiveFile,
} from '../../services/backup/backupImportService';
import { isSubscriptionExpired } from '../../services/subscriptionService';
import useAuthStore from '../../store/useAuthStore';
import useDraftStore from '../../store/useDraftStore';
import useWorkStore from '../../store/useWorkStore';
import {
    Colors,
    FontFamily,
    FontSize,
    FontWeight,
    Spacing,
} from '../../theme';
import {
    formatBackupSizeLabel,
    resolveBackupErrorMessage,
} from '../../utils/backupUiUtils';
import { performLogout } from '../../utils/logout';
import {
    formatSubscriptionExpiryDate,
    getSubscriptionTimeLeftText,
} from '../../utils/subscriptionDisplay';

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
  const [backupProgress, setBackupProgress] = useState(null);

  const isActivated = useAuthStore((state) => state.isActivated);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const refreshWorks = useWorkStore((state) => state.refreshWorks);
  const clearCurrentWork = useWorkStore((state) => state.clearCurrentWork);
  const clearAllDrafts = useDraftStore((state) => state.clearAllDrafts);

  const backupBusy = backupProgress != null;

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

  const showExportSuccess = useCallback(
    (result) => {
      if (result.missingFileCount > 0) {
        Alert.alert(
          t('backup.successTitle'),
          t('backup.successWithWarnings', { count: result.missingFileCount }),
        );
        return;
      }

      if (!result.shared) {
        Alert.alert(t('backup.successTitle'), t('backup.successSavedLocally'));
        return;
      }

      Alert.alert(t('backup.successTitle'), t('backup.successMessage'));
    },
    [t],
  );

  const runExport = useCallback(
    async (preview) => {
      setBackupProgress({ mode: 'export', phase: 'reading' });

      try {
        const archive = await createBackupArchive({
          estimatedArchiveBytes: preview.estimatedArchiveBytes,
          onProgress: (phase) => setBackupProgress({ mode: 'export', phase }),
        });

        // Dismiss the loading modal BEFORE presenting the share sheet. On iOS the
        // system share sheet cannot be presented over an already-visible RN
        // <Modal>, which otherwise leaves the UI stuck on the loading state.
        setBackupProgress(null);
        await new Promise((resolve) => setTimeout(resolve, 350));

        const shared = await shareBackupArchive(archive.filePath, {
          shareDialogTitle: t('backup.shareTitle'),
        });

        showExportSuccess({ ...archive, shared });
      } catch (error) {
        Alert.alert(
          t('backup.errorTitle'),
          resolveBackupErrorMessage(error, t, 'backup'),
        );
      } finally {
        setBackupProgress(null);
      }
    },
    [showExportSuccess, t],
  );

  const handleExportBackup = useCallback(async () => {
    if (backupBusy) return;

    setBackupProgress({ mode: 'export', phase: 'reading' });

    let preview;
    try {
      preview = await getBackupExportPreview();
    } catch (error) {
      setBackupProgress(null);
      Alert.alert(
        t('backup.errorTitle'),
        resolveBackupErrorMessage(error, t, 'backup'),
      );
      return;
    }

    setBackupProgress(null);

    if (preview.totalRows === 0) {
      Alert.alert(t('backup.emptyTitle'), t('backup.emptyMessage'));
      return;
    }

    const startExport = () => {
      runExport(preview);
    };

    if (preview.isLarge) {
      Alert.alert(
        t('backup.sizeWarningTitle'),
        t('backup.sizeWarningMessage', {
          size: formatBackupSizeLabel(preview.estimatedArchiveBytes, i18n.language),
        }),
        [
          { text: t('restore.cancel'), style: 'cancel' },
          { text: t('backup.continue'), onPress: startExport },
        ],
      );
      return;
    }

    startExport();
  }, [backupBusy, i18n.language, runExport, t]);

  const handleImportBackup = useCallback(async () => {
    if (backupBusy) return;

    // Present the file picker on a clean screen FIRST. iOS cannot present the
    // document picker over a visible RN <Modal>, which otherwise leaves the UI
    // stuck on "Reading backup file…".
    let pick;
    try {
      pick = await pickBackupArchiveFile();
    } catch (error) {
      Alert.alert(
        t('restore.errorTitle'),
        resolveBackupErrorMessage(error, t, 'restore'),
      );
      return;
    }

    if (pick.canceled) return;

    let inspection;
    let stagingDir;

    setBackupProgress({ mode: 'import', phase: 'validating' });
    try {
      const inspected = inspectBackupArchiveFile(pick.fileUri, {
        language: i18n.language,
        onProgress: (phase) => setBackupProgress({ mode: 'import', phase }),
      });
      inspection = inspected.inspection;
      stagingDir = inspected.stagingDir;
    } catch (error) {
      setBackupProgress(null);
      Alert.alert(
        t('restore.errorTitle'),
        resolveBackupErrorMessage(error, t, 'restore'),
      );
      return;
    }

    setBackupProgress(null);

    if (!inspection.valid) {
      cleanupDirectory(stagingDir);
      const code = inspection.errorCodes?.[0];
      const message = code
        ? t(`restore.errors.${code}`, { defaultValue: t('restore.invalidMessage') })
        : t('restore.invalidMessage');
      Alert.alert(t('restore.invalidTitle'), message);
      return;
    }

    const exportedLabel = inspection.exportedAtLabel || inspection.exportedAt || '—';
    const sizeLabel = formatBackupSizeLabel(
      inspection.archiveSizeBytes || inspection.totalBytes,
      i18n.language,
    );

    Alert.alert(
      t('restore.confirmTitle'),
      t('restore.confirmMessageDetailed', {
        works: inspection.workCount,
        files: inspection.fileCount,
        size: sizeLabel,
        date: exportedLabel,
      }),
      [
        {
          text: t('restore.cancel'),
          style: 'cancel',
          onPress: () => cleanupDirectory(stagingDir),
        },
        {
          text: t('restore.confirmButton'),
          style: 'destructive',
          onPress: () => {
              setBackupProgress({ mode: 'import', phase: 'restoring' });
              importInspectedBackupArchive(stagingDir, {
                inspection,
                onProgress: (phase) => setBackupProgress({ mode: 'import', phase }),
              })
              .then(async () => {
                clearCurrentWork();
                clearAllDrafts();
                await refreshWorks();
                Alert.alert(t('restore.successTitle'), t('restore.successMessage'));
              })
              .catch((error) => {
                Alert.alert(
                  t('restore.errorTitle'),
                  resolveBackupErrorMessage(error, t, 'restore'),
                );
              })
              .finally(() => {
                setBackupProgress(null);
              });
          },
        },
      ],
    );
  }, [
    backupBusy,
    clearAllDrafts,
    clearCurrentWork,
    i18n.language,
    refreshWorks,
    t,
  ]);

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
            disabled={backupBusy}
            title={t('backup.title')}
            subtitle={t('backup.subtitle')}
            onPress={handleExportBackup}
            leftIcon={
              <Ionicons name="cloud-upload-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
          <NavigationCard
            disabled={backupBusy}
            title={t('restore.title')}
            subtitle={t('restore.subtitle')}
            onPress={handleImportBackup}
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
            onPress={performLogout}
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
        onBackupPress={handleExportBackup}
        onRestorePress={handleImportBackup}
      />

      <BackupProgressModal
        visible={backupBusy}
        mode={backupProgress?.mode ?? null}
        phase={backupProgress?.phase ?? null}
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
