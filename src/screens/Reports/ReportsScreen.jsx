import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import NotificationButton from '../../components/Notificationbutton';
import FinancialYearDropdown from '../../components/dashboard/FinancialYearDropdown';
import { workCompletedToChipStatus } from '../../components/Statuschip';
import useWorkStore from '../../store/useWorkStore';
import theme from '../../theme';
import ReportCategoryChipRow from '../../components/reports/ReportCategoryChipRow';
import ReportStatCard from '../../components/reports/ReportStatCard';
import ReportInfoBanner from '../../components/reports/ReportInfoBanner';
import ReportBudgetCard from '../../components/reports/ReportBudgetCard';
import ReportExportSection from '../../components/reports/ReportExportSection';
import ReportShareCard from '../../components/reports/ReportShareCard';
import { translateBudgetSummary } from '../../i18n/reportLabels';
import {
  emptyBudgetSummary,
  filterWorksByFinancialYear,
  getReportsBudgetSummary,
} from '../../db/repositories/reportsRepository';
import { exportFinancialYearReportPdf } from '../../services/reportsPdfExportService';

const ReportsScreen = () => {
  const { t, i18n } = useTranslation('reports');
  const { works, refreshWorks } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');
  const [rawBudgetSummary, setRawBudgetSummary] = useState(() => emptyBudgetSummary());
  const [exportingPdf, setExportingPdf] = useState(false);

  const budgetSummary = useMemo(
    () => translateBudgetSummary(rawBudgetSummary),
    [rawBudgetSummary, i18n.language],
  );

  const workStats = useMemo(() => {
    const fyWorks = filterWorksByFinancialYear(works, fy);
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    fyWorks.forEach((work) => {
      const status = workCompletedToChipStatus(work.work_completed);
      if (status === 'completed') completed += 1;
      else if (status === 'progress') inProgress += 1;
      else pending += 1;
    });

    return {
      total: fyWorks.length,
      completed,
      inProgress,
      pending,
    };
  }, [works, fy]);

  const loadBudgetSummary = useCallback(() => {
    try {
      setRawBudgetSummary(getReportsBudgetSummary(fy, { useTotalAmountPaid: true }));
    } catch (error) {
      console.error('[ReportsScreen] getReportsBudgetSummary failed:', error);
      setRawBudgetSummary(emptyBudgetSummary());
    }
  }, [fy]);

  useFocusEffect(
    useCallback(() => {
      refreshWorks();
      loadBudgetSummary();
    }, [refreshWorks, loadBudgetSummary]),
  );

  useEffect(() => {
    loadBudgetSummary();
  }, [loadBudgetSummary]);

  const handleFyChange = useCallback((nextFy) => {
    setFy(nextFy);
  }, []);

  const pdfExportLabels = useMemo(
    () => ({
      shareTitle: t('export.shareTitle'),
    }),
    [t],
  );

  const handleExportPdf = useCallback(async () => {
    if (exportingPdf) return;

    setExportingPdf(true);
    try {
      const result = await exportFinancialYearReportPdf({
        financialYear: fy,
        works,
        labels: pdfExportLabels,
      });

      if (result.noData) {
        Alert.alert(t('export.noDataTitle'), t('export.noDataMessage'));
        return;
      }

      Alert.alert(t('export.successTitle'), t('export.successMessage'));
    } catch (error) {
      console.error('[ReportsScreen] export PDF failed:', error);
      Alert.alert(t('export.errorTitle'), t('export.errorMessage'));
    } finally {
      setExportingPdf(false);
    }
  }, [exportingPdf, fy, works, pdfExportLabels, t]);

  return (
    <>
      <ScreenLayout
        title={t('title')}
        showMenu
        showNotification={false}
        scrollable
        onMenuPress={() => setDrawerOpen(true)}
        headerRight={
          <View style={styles.headerRight}>
            <FinancialYearDropdown value={fy} onChange={handleFyChange} />
            <NotificationButton
              iconColor={theme.Colors.white ?? '#FFFFFF'}
              iconSize={20}
            />
          </View>
        }
        contentStyle={styles.scrollContent}
      >
        <ReportCategoryChipRow style={styles.chips} />

        <View style={styles.statsRow}>
          <ReportStatCard
            variant="total"
            value={String(workStats.total)}
            title={t('stats.totalWorks')}
            subtitle={t('stats.totalWorksSubtitle')}
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            variant="completed"
            value={String(workStats.completed)}
            title={t('stats.completed')}
            subtitle={t('stats.completedSubtitle')}
          />
        </View>

        <View style={styles.statsRow}>
          <ReportStatCard
            variant="inProgress"
            value={String(workStats.inProgress)}
            title={t('stats.inProgress')}
            subtitle={t('stats.inProgressSubtitle')}
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            variant="pending"
            value={String(workStats.pending)}
            title={t('stats.pending')}
            subtitle={t('stats.pendingSubtitle')}
          />
        </View>

        <ReportInfoBanner message={budgetSummary.bannerText} />

        <ReportBudgetCard
          barPrimaryLabel={budgetSummary.barPrimaryLabel}
          barRemainingLabel={budgetSummary.barRemainingLabel}
          totalBudgetDetail={budgetSummary.totalBudgetDetail}
          totalUsedDetail={budgetSummary.totalUsedDetail}
          progressPercent={budgetSummary.percent}
        />

        <ReportExportSection
          onExportPdf={handleExportPdf}
          exportingPdf={exportingPdf}
        />

        <ReportShareCard />
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 28,
  },
  chips: {
    marginBottom: 14,
    marginHorizontal: -4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statsGap: {
    width: 12,
  },
});

export default ReportsScreen;
