import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import FinancialYearDropdown from '../../components/dashboard/FinancialYearDropdown';
import SearchBar from '../../components/dashboard/SearchBar';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import BudgetUtilisationCard from '../../components/dashboard/BudgetUtilisationCard';
import RecentWorkCard from '../../components/dashboard/RecentWorkCard';
import { workCompletedToChipStatus } from '../../components/Statuschip';
import { getTotalAmountPaidAll } from '../../db/repositories/paymentsRepository';
import useWorkStore from '../../store/useWorkStore';
import { Colors } from '../../theme';

const PRIMARY = '#062E52';
const RECENT_WORK_LIMIT = 3;

const formatBudgetUsed = (amount) => {
  const n = Number(amount) || 0;
  if (n === 0) return '₹0';
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const ringPercent = (part, whole, fallback = 0) => {
  if (!whole || whole <= 0) return fallback;
  return Math.min(100, Math.round((part / whole) * 100));
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { works, refreshWorks } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');
  const [search, setSearch] = useState('');
  const [budgetUsedTotal, setBudgetUsedTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refreshWorks();
      try {
        setBudgetUsedTotal(getTotalAmountPaidAll());
      } catch (error) {
        console.error('[Dashboard] getTotalAmountPaidAll failed:', error);
        setBudgetUsedTotal(0);
      }
    }, [refreshWorks]),
  );

  const dashboardStats = useMemo(() => {
    const total = works.length;
    let complete = 0;
    let pending = 0;

    works.forEach((work) => {
      const status = workCompletedToChipStatus(work.work_completed);
      if (status === 'completed') complete += 1;
      else if (status === 'pending') pending += 1;
    });

    const totalBudget = works.reduce(
      (sum, work) => sum + (Number(work.budget) || 0),
      0,
    );

    return {
      total,
      complete,
      pending,
      budgetUsedTotal,
      totalPercent: total > 0 ? 100 : 0,
      completePercent: ringPercent(complete, total),
      pendingPercent: ringPercent(pending, total),
      budgetPercent: ringPercent(budgetUsedTotal, totalBudget),
      budgetDisplay: formatBudgetUsed(budgetUsedTotal),
    };
  }, [works, budgetUsedTotal]);

  const recentWorks = useMemo(
    () => works.slice(0, RECENT_WORK_LIMIT),
    [works],
  );

  const handleViewAll = useCallback(() => {
    navigation.navigate('Works');
  }, [navigation]);

  return (
    <>
      <ScreenLayout
        title="Dashboard"
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
          style={styles.search}
        />

        <View style={styles.statsRow}>
          <DashboardStatCard
            label="Total Work"
            value={String(dashboardStats.total)}
            percent={dashboardStats.totalPercent}
            ringColor="#9CA3AF"
            trackColor="#E5E7EB"
          />
          <View style={styles.statsGap} />
          <DashboardStatCard
            label="Complete"
            value={String(dashboardStats.complete)}
            percent={dashboardStats.completePercent}
            ringColor="#2F5E34"
            trackColor="#D9EDE2"
          />
        </View>

        <View style={styles.statsRow}>
          <DashboardStatCard
            label="Pending"
            value={String(dashboardStats.pending)}
            percent={dashboardStats.pendingPercent}
            ringColor="#FF5D00"
            trackColor="#FFE8D6"
          />
          <View style={styles.statsGap} />
          <DashboardStatCard
            label="Budget Used"
            value={dashboardStats.budgetDisplay}
            percent={dashboardStats.budgetPercent}
            ringColor={PRIMARY}
            trackColor="#D6E8F7"
            valueFontSize={15}
          />
        </View>

        <BudgetUtilisationCard percent={65} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Work</Text>
          <Pressable
            onPress={handleViewAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all works"
          >
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {recentWorks.length === 0 ? (
          <Text style={styles.emptyRecent}>No recent work available</Text>
        ) : (
          recentWorks.map((work) => (
            <RecentWorkCard
              key={String(work.id)}
              title={work.work_name || 'Untitled work'}
              code={work.work_code || '—'}
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
