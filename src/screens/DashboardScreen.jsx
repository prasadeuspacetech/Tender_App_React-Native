// src/screens/DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Shadow, Radius, Spacing } from '../theme';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const PRIMARY_COLOR = '#062E52';

// High-quality mock tenders
const MOCK_TENDERS = [
  {
    id: 'TND/2026/0491',
    title: 'Construction of 4-Lane Bypass Highway (Section III)',
    department: 'National Highways Authority of India (NHAI)',
    value: '₹84.50 Crores',
    location: 'Nagpur, Maharashtra',
    deadline: '2026-07-15',
    category: 'Infrastructure',
  },
  {
    id: 'TND/2026/0812',
    title: 'Smart Water Distribution Grid & Filtration Plant',
    department: 'Municipal Corporation of Greater Mumbai (MCGM)',
    value: '₹12.80 Crores',
    location: 'Mumbai Suburbs, MH',
    deadline: '2026-07-02',
    category: 'Civil Works',
  },
  {
    id: 'TND/2026/1093',
    title: 'Installation of Solar Street Lighting & Microgrids',
    department: 'Maharashtra Energy Development Agency (MEDA)',
    value: '₹3.45 Crores',
    location: 'Pune District, MH',
    deadline: '2026-06-28',
    category: 'Electrical',
  },
  {
    id: 'TND/2026/0304',
    title: 'Supply and Implementation of Smart City IT Infrastructure',
    department: 'Pune Smart City Development Corporation',
    value: '₹85 Lakhs',
    location: 'Pune, Maharashtra',
    deadline: '2026-06-25',
    category: 'IT & Services',
  },
  {
    id: 'TND/2026/1255',
    title: 'Construction of RCC Drainage Systems & Culverts',
    department: 'Public Works Department (PWD)',
    value: '₹1.20 Crores',
    location: 'Nashik, Maharashtra',
    deadline: '2026-07-20',
    category: 'Drainage Works',
  }
];

const DashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract user and subscription details from navigation params
  const { user = {}, subscription = {} } = route.params || {};

  const [remainingText, setRemainingText] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Helper to format remaining time dynamically
  const getRemainingTimeText = (expiryDateString) => {
    if (!expiryDateString) return 'No active subscription';
    
    const expiry = new Date(expiryDateString);
    const now = new Date();
    const diffMs = expiry - now;
    
    if (diffMs <= 0) {
      return 'Expired';
    }

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

  // Background Check Loop (Every 60s)
  useEffect(() => {
    const checkSubscriptionExpiry = () => {
      if (!subscription.expiresAt) return;

      const expiry = new Date(subscription.expiresAt);
      const now = new Date();

      if (expiry <= now) {
        setIsExpired(true);
        setShowModal(true);
      } else {
        setRemainingText(getRemainingTimeText(subscription.expiresAt));
      }
    };

    // Run immediately on mount
    checkSubscriptionExpiry();

    // Set interval to check every 60 seconds (60000ms)
    const intervalId = setInterval(checkSubscriptionExpiry, 60000);

    return () => clearInterval(intervalId);
  }, [subscription.expiresAt]);

  const handleLogout = () => {
    navigation.replace('Activation');
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigation.replace('Activation');
  };

  // Render Item for Tender List
  const renderTenderItem = ({ item }) => {
    // Format the date for cleaner UI
    const dateFormatted = new Date(item.deadline).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={[styles.tenderCard, Shadow.card]}>
        <View style={styles.tenderHeader}>
          <Text style={styles.tenderId}>{item.id}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.tenderTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.tenderDept}>
          {item.department}
        </Text>

        <View style={styles.divider} />

        <View style={styles.tenderFooter}>
          <View style={styles.footerInfoItem}>
            <MaterialIcons name="monetization-on" size={16} color={PRIMARY_COLOR} />
            <Text style={styles.footerInfoText}>{item.value}</Text>
          </View>
          
          <View style={styles.footerInfoItem}>
            <MaterialIcons name="location-on" size={16} color="#4A5568" />
            <Text style={styles.footerInfoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={[styles.footerInfoItem, styles.deadlineRow]}>
          <MaterialIcons name="event" size={16} color="#E53E3E" />
          <Text style={styles.deadlineText}>Due by: {dateFormatted}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user.name || 'User'}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="power-settings-new" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Subscription Card */}
      <View style={styles.subscriptionWrapper}>
        <View style={[styles.subscriptionCard, Shadow.card]}>
          <View style={styles.subCardHeader}>
            <Text style={styles.subCardTitle}>Your Subscription Status</Text>
            <View style={[
              styles.statusChip, 
              { backgroundColor: isExpired ? '#FEE2E2' : '#DCFCE7' }
            ]}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: isExpired ? '#DC2626' : '#16A34A' }
              ]} />
              <Text style={[
                styles.statusText, 
                { color: isExpired ? '#991B1B' : '#166534' }
              ]}>
                {isExpired ? 'Expired' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.subCardBody}>
            <View style={styles.subRow}>
              <MaterialIcons name="vpn-key" size={16} color="#718096" />
              <Text style={styles.subLabel}>Access Key: </Text>
              <Text style={styles.subValueCode}>{subscription.key || 'N/A'}</Text>
            </View>

            <View style={styles.subRow}>
              <MaterialIcons name="alarm" size={16} color="#718096" />
              <Text style={styles.subLabel}>Time Left: </Text>
              <Text style={[
                styles.subValue, 
                { color: isExpired ? '#E53E3E' : PRIMARY_COLOR, fontWeight: '700' }
              ]}>
                {remainingText}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tenders List Header */}
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeading}>Available Tenders</Text>
        <Text style={styles.listSubheading}>Real-time active contracts listings</Text>
      </View>

      {/* Tenders List */}
      <FlatList
        data={MOCK_TENDERS}
        renderItem={renderTenderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tenders available at the moment.</Text>
          </View>
        }
      />

      {/* Subscription Expiry Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadow.modal]}>
            <View style={styles.modalIconBg}>
              <MaterialIcons name="warning" size={32} color="#DC2626" />
            </View>
            
            <Text style={styles.modalTitle}>Subscription Expired</Text>
            
            <Text style={styles.modalMessage}>
              Your subscription has expired. Please contact administrator.
            </Text>

            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleModalClose}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    marginLeft: Spacing.sm,
  },
  welcomeText: {
    fontSize: 12,
    color: '#ADCFED',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  subscriptionWrapper: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg, // 14
    padding: Spacing.md,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
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
    gap: Spacing.xs,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  subLabel: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 6,
  },
  subValue: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  subValueCode: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  listHeaderContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  listHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  listSubheading: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  tenderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl, // 20
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  tenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tenderId: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  categoryBadge: {
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  tenderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    lineHeight: 20,
    marginBottom: 4,
  },
  tenderDept: {
    fontSize: 12,
    color: '#718096',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: Spacing.xs,
  },
  tenderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  footerInfoText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
  },
  deadlineRow: {
    marginTop: Spacing.xs,
    justifyContent: 'flex-start',
  },
  deadlineText: {
    fontSize: 12,
    color: '#E53E3E',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 46, 82, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl, // 20
    padding: Spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalIconBg: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalButton: {
    backgroundColor: '#DC2626',
    borderRadius: Radius.full,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DashboardScreen;
