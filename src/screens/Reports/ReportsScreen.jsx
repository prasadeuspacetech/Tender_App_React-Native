import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import NotificationButton from '../../components/Notificationbutton';
import FinancialYearDropdown from '../../components/dashboard/FinancialYearDropdown';
import theme from '../../theme';
import ReportCategoryChipRow from '../../components/reports/ReportCategoryChipRow';
import ReportStatCard from '../../components/reports/ReportStatCard';
import ReportInfoBanner from '../../components/reports/ReportInfoBanner';
import ReportBudgetCard from '../../components/reports/ReportBudgetCard';
import ReportExportSection from '../../components/reports/ReportExportSection';
import ReportShareCard from '../../components/reports/ReportShareCard';

const ReportsScreen = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');

  return (
    <>
      <ScreenLayout
        title="Reports"
        showMenu
        showNotification={false}
        scrollable
        onMenuPress={() => setDrawerOpen(true)}
        headerRight={
          <View style={styles.headerRight}>
            <FinancialYearDropdown value={fy} onChange={setFy} />
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
            value="34"
            title="Total Works"
            subtitle="+4 from last year"
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            value="12"
            title="Completed"
            subtitle="58% completed rate"
          />
        </View>

        <View style={styles.statsRow}>
          <ReportStatCard
            value="20"
            title="In Progress"
            subtitle="Target: complete by Aug"
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            value="02"
            title="Pending"
            subtitle="Needs attention"
          />
        </View>

        <ReportInfoBanner />

        <ReportBudgetCard />

        <ReportExportSection />

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
