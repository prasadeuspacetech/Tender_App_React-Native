import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const route = useRoute();

  // 🔥 FIREBASE: Get user and subscription data from login
  const { userData, subscription } = route.params || {};

  // ✅ SQLITE: Your existing stores
  const { works, refreshWorks } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');
  const [search, setSearch] = useState('');
  const [rawBudgetSummary, setRawBudgetSummary] = useState(() => emptyBudgetSummary());

  // 🔥 FIREBASE: Subscription expiry states
  const [remainingText, setRemainingText] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  // 🔥 FIREBASE: Get remaining time text
  const getRemainingTimeText = (expiryDateString) => {
    if (!expiryDateString) return 'No active subscription';
    const expiry = new Date(expiryDateString);
    const now = new Date();
    const diffMs = expiry - now;
    if (diffMs <= 0) return 'Expired';
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    return `${parts.join(' ')} remaining`;
  };

  // 🔥 FIREBASE: Check subscription expiry every minute
  useEffect(() => {
    const checkExpiry = () => {
      if (!subscription?.expiresAt) return;
      const expiry = new Date(subscription.expiresAt);
      const now = new Date();
      if (expiry <= now) {
        setIsExpired(true);
        setShowExpiryModal(true);
      } else {
        setRemainingText(getRemainingTimeText(subscription.expiresAt));
      }
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [subscription?.expiresAt]);

  // ✅ SQLITE: Load budget summary
  const loadBudgetSummary = useCallback(() => {
    try {
      const summary = getReportsBudgetSummary(fy, { useTotalAmountPaid: true });
      setRawBudgetSummary(summary);
    } catch (error) {
      console.error('[Dashboard] getReportsBudgetSummary failed:', error);
      setRawBudgetSummary(emptyBudgetSummary());
    }
  }, [fy]);

  // ✅ SQLITE: Refresh works on focus
  useFocusEffect(
    useCallback(() => {
      refreshWorks();
      loadBudgetSummary();
    }, [refreshWorks, loadBudgetSummary]),
  );

  useEffect(() => {
    loadBudgetSummary();
  }, [loadBudgetSummary]);

  // ✅ SQLITE: Calculate dashboard stats
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

  // ✅ SQLITE: Budget utilisation
  const budgetUtilisation = useMemo(
    () => getFyBudgetUtilisationSummary(fy, works),
    [fy, works],
  );

  const recentWorks = useMemo(
    () => works.slice(0, RECENT_WORK_LIMIT),
    [works],
  );

  const handleViewAll = useCallback(() => {
    navigation.navigate('Works');
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => navigation.replace('Activation') }
    ]);
  };

  const handleModalClose = () => {
    setShowExpiryModal(false);
    navigation.replace('Activation');
  };

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
        {/* 🔥 FIREBASE: Subscription Status Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subCardHeader}>
            <View>
              <Text style={styles.subCardTitle}>Subscription Status</Text>
              <Text style={styles.userNameText}>{userData?.name || 'User'}</Text>
              <Text style={styles.userMobileText}>{userData?.mobile || ''}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: isExpired ? '#FEE2E2' : '#DCFCE7' }]}>
              <View style={[styles.statusDot, { backgroundColor: isExpired ? '#DC2626' : '#16A34A' }]} />
              <Text style={[styles.statusText, { color: isExpired ? '#991B1B' : '#166534' }]}>
                {isExpired ? 'Expired' : 'Active'}
              </Text>
            </View>
          </View>
          <View style={styles.subCardBody}>
            <View style={styles.subRow}>
              <MaterialIcons name="vpn-key" size={16} color="#718096" />
              <Text style={styles.subLabel}>Access Key:</Text>
              <Text style={styles.subValueCode}>{subscription?.key || 'N/A'}</Text>
            </View>
            <View style={styles.subRow}>
              <MaterialIcons name="alarm" size={16} color="#718096" />
              <Text style={styles.subLabel}>Time Left:</Text>
              <Text style={[styles.subValue, { color: isExpired ? '#DC2626' : PRIMARY }]}>
                {isExpired ? 'Expired' : remainingText || 'Loading...'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutButtonSmall} onPress={handleLogout}>
              <MaterialIcons name="logout" size={16} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ SQLITE: Search Bar */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('common:search')}
          style={styles.search}
        />

        {/* ✅ SQLITE: Stats Cards */}
        <View style={styles.statsRow}>
          <DashboardStatCard
            label={t('dashboard:stats.totalWork')}
            value={String(dashboardStats.total)}
            percent={dashboardStats.totalPercent}
            ringColor="#9CA3AF"
            trackColor="#D9EDE2"
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

        {/* ✅ SQLITE: Budget Utilisation Card */}
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

        {/* ✅ SQLITE: Recent Works */}
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

      {/* 🔥 FIREBASE: Expiry Modal */}
      <Modal
        visible={showExpiryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBg}>
              <MaterialIcons name="warning" size={32} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Subscription Expired</Text>
            <Text style={styles.modalMessage}>
              Your subscription has expired. Please contact your administrator to renew.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Firebase Subscription Card Styles
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 12,
    marginBottom: 12,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 4,
  },
  userMobileText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subCardBody: {
    gap: 8,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 6,
    width: 75,
  },
  subValue: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
    flex: 1,
  },
  subValueCode: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    flex: 1,
  },
  logoutButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 46, 82, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: PRIMARY,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;