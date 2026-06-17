import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BudgetUtilisationCard from '../../components/dashboard/BudgetUtilisationCard';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import { dashboardSectionLabelStyle } from '../../components/dashboard/dashboardTypography';
import FinancialYearDropdown from '../../components/dashboard/FinancialYearDropdown';
import RecentWorkCard from '../../components/dashboard/RecentWorkCard';
import SearchBar from '../../components/dashboard/SearchBar';
import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import { workCompletedToChipStatus } from '../../components/Statuschip';
import {
  emptyBudgetSummary,
  filterWorksByFinancialYear,
  getFyBudgetUtilisationSummary,
  getReportsBudgetSummary,
} from '../../db/repositories/reportsRepository';
import useWorkStore from '../../store/useWorkStore';
import { Colors } from '../../theme';

const PRIMARY = '#062E52';
const RECENT_WORK_LIMIT = 3;

const formatBudgetUsed = (amount) => {
  const n = Number(amount) || 0;
  if (n === 0) return '₹0';
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const ringPercent = (part, whole, fallback = 0) => {
  if (!whole || whole <= 0) return fallback;
  return Math.min(100, Math.round((part / whole) * 100));
};

const DashboardScreen = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigation = useNavigation();
  const { works, refreshWorks } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');
  const [search, setSearch] = useState('');
  const [rawBudgetSummary, setRawBudgetSummary] = useState(() => emptyBudgetSummary());

  const loadBudgetSummary = useCallback(() => {
    try {
      setRawBudgetSummary(getReportsBudgetSummary(fy, { useTotalAmountPaid: true }));
    } catch (error) {
      console.error('[Dashboard] getReportsBudgetSummary failed:', error);
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

  const dashboardStats = useMemo(() => {
    const fyWorks = filterWorksByFinancialYear(works, fy);
    const total = fyWorks.length;
    let complete = 0;
    let inProgress = 0;

    fyWorks.forEach((work) => {
      const status = workCompletedToChipStatus(work.work_completed);
      if (status === 'completed') complete += 1;
      else if (status === 'progress') inProgress += 1;
    });

    return {
      total,
      complete,
      inProgress,
      totalPercent: total > 0 ? 100 : 0,
      completePercent: ringPercent(complete, total),
      inProgressPercent: ringPercent(inProgress, total),
      budgetPercent: rawBudgetSummary.percent,
      budgetDisplay: formatBudgetUsed(rawBudgetSummary.budgetUsed),
    };
  }, [works, fy, rawBudgetSummary]);

  const budgetUtilisation = useMemo(
    () => getFyBudgetUtilisationSummary(fy, works),
    [fy, works],
  );

  const recentWorks = useMemo(() => {
    const fyWorks = filterWorksByFinancialYear(works, fy);
    return fyWorks.slice(0, RECENT_WORK_LIMIT);
  }, [works, fy]);

  const handleViewAll = useCallback(() => {
    navigation.navigate('Works');
  }, [navigation]);

  return (
    <>
      <ScreenLayout
        title={t('dashboard:title')}
        showMenu
        showNotification={false}
        scrollable
        onMenuPress={() => setDrawerOpen(true)}
        headerRight={<FinancialYearDropdown value={fy} onChange={setFy} />}
        contentStyle={styles.scrollContent}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('common:search')}
          style={styles.search}
        />

        <View style={styles.statsRow}>
          <DashboardStatCard
            label={t('dashboard:stats.totalWork')}
            value={String(dashboardStats.total)}
            percent={dashboardStats.totalPercent}
            ringColor="#9CA3AF"
            trackColor={dashboardStats.total === 0 ? '#9CA3AF' : '#D9EDE2'}
          />
          <View style={styles.statsGap} />
          <DashboardStatCard
            label={t('dashboard:stats.complete')}
            value={String(dashboardStats.complete)}
            percent={dashboardStats.completePercent}
            ringColor="#2F5E34"
            trackColor="#2F5E34"
          />
        </View>

        <View style={styles.statsRow}>
          <DashboardStatCard
            label={t('dashboard:stats.inProgress')}
            value={String(dashboardStats.inProgress)}
            percent={dashboardStats.inProgressPercent}
            ringColor="#FF5D00"
            trackColor="#FF5D00"
          />
          <View style={styles.statsGap} />
          <DashboardStatCard
            label={t('dashboard:stats.budgetUsed')}
            value={dashboardStats.budgetDisplay}
            percent={dashboardStats.budgetPercent}
            ringColor={PRIMARY}
            trackColor={PRIMARY}
            valueFontSize={15}
          />
        </View>

        <BudgetUtilisationCard
          percent={budgetUtilisation.percent}
          title={t('dashboard:budgetUtilisation')}
          workCountLabel={t('dashboard:budgetUtilisationRows.workCount')}
          totalBudgetLabel={t('dashboard:budgetUtilisationRows.totalBudget')}
          totalSpendLabel={t('dashboard:budgetUtilisationRows.totalSpend')}
          workCount={budgetUtilisation.workCount}
          totalBudget={budgetUtilisation.totalBudget}
          totalSpend={budgetUtilisation.totalSpend}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard:recentWork')}</Text>
          <Pressable
            onPress={handleViewAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard:viewAllAccessibility')}
          >
            <Text style={styles.viewAll}>{t('dashboard:viewAll')}</Text>
          </Pressable>
        </View>

        {recentWorks.length === 0 ? (
          <Text style={styles.emptyRecent}>{t('dashboard:emptyRecent')}</Text>
        ) : (
          recentWorks.map((work) => (
            <RecentWorkCard
              key={String(work.id)}
              title={work.work_name || t('common:untitledWork')}
              code={work.work_code || t('common:dash')}
              status={workCompletedToChipStatus(work.work_completed)}
              iconName="construct-outline"
            />
          ))
        )}
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  search: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statsGap: {
    width: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    ...dashboardSectionLabelStyle,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary ?? PRIMARY,
  },
  emptyRecent: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default DashboardScreen;
