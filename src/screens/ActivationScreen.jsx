// src/screens/ActivationScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, ref, query, orderByChild, equalTo, get } from '../services/firebase';
import { Colors, Shadow, Radius, Spacing, Typography } from '../theme';

const PRIMARY_COLOR = '#062E52';

const ActivationScreen = () => {
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Input Formatting & Sanitization
  const handleMobileChange = (text) => {
    // Keep only numbers and restrict to 10 digits
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobile(cleaned);
  };

  const handleKeyChange = (text) => {
    // Auto-uppercase and restrict to 15 characters
    const uppercased = text.toUpperCase().slice(0, 15);
    setAccessKey(uppercased);
  };

  const handleActivate = async () => {
    // Validation checks
    if (mobile.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (accessKey.length !== 15) {
      Alert.alert('Validation Error', 'Please enter a valid 15-character access key.');
      return;
    }

    setLoading(true);

    try {
      // 1. Query Firebase Realtime Database
      // Attempt 1: Query with '91' prefix (standard format in database)
      const formattedMobile = `91${mobile}`;
      const usersRef = ref(db, 'users');
      const mobileQuery = query(usersRef, orderByChild('mobile'), equalTo(formattedMobile));
      
      let snapshot = await get(mobileQuery);
      let usersData = snapshot.val();

      // Attempt 2: Fallback query with raw 10-digit mobile
      if (!usersData) {
        const rawMobileQuery = query(usersRef, orderByChild('mobile'), equalTo(mobile));
        snapshot = await get(rawMobileQuery);
        usersData = snapshot.val();
      }

      if (!usersData) {
        Alert.alert('Activation Failed', 'No account associated with this mobile number was found.');
        setLoading(false);
        return;
      }

      // Extract user details (the query returns an object with user keys)
      const userIds = Object.keys(usersData);
      const userId = userIds[0];
      const user = usersData[userId];

      // 2. Validate Subscription Key
      const subscription = user.subscription;
      if (!subscription || subscription.key !== accessKey) {
        Alert.alert('Activation Failed', 'The access key you entered is incorrect.');
        setLoading(false);
        return;
      }

      // 3. Validate Expiration
      const expiresAt = new Date(subscription.expiresAt);
      const now = new Date();
      if (expiresAt <= now) {
        Alert.alert(
          'Subscription Expired',
          'Your subscription has expired. Please contact your administrator.'
        );
        setLoading(false);
        return;
      }

      // 4. On Success: Navigate to Dashboard with User Data
      setLoading(false);
      navigation.replace('Dashboard', {
        user: {
          id: userId,
          name: user.name || 'User',
          mobile: user.mobile,
          email: user.email || '',
        },
        subscription: {
          key: subscription.key,
          expiresAt: subscription.expiresAt,
          createdAt: subscription.createdAt || '',
          durationValue: subscription.durationValue || 0,
          durationUnit: subscription.durationUnit || '',
        }
      });

    } catch (error) {
      console.error('Activation Error:', error);
      Alert.alert('System Error', 'Could not complete activation. Please check your network connection.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>TENDER PRO</Text>
            <Text style={styles.brandSubtitle}>Subscription Portal</Text>
          </View>

          {/* Login Card */}
          <View style={[styles.card, Shadow.card]}>
            <Text style={styles.cardHeader}>Activate Access</Text>
            <Text style={styles.cardSubheader}>
              Enter your registered mobile number and 15-character access key to continue.
            </Text>

            {/* Mobile Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={10}
                value={mobile}
                onChangeText={handleMobileChange}
                editable={!loading}
              />
            </View>

            {/* Access Key Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Access Key</Text>
              <TextInput
                style={[styles.textInput, styles.keyInput]}
                placeholder="X9C2M5P8R1A7B3K4"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="characters"
                maxLength={15}
                value={accessKey}
                onChangeText={handleKeyChange}
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleActivate}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Activate App</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Secured by Tender Subscription Management System
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#ADCFED',
    fontWeight: '400',
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl, // 20
    padding: Spacing.lg,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 440,
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  cardSubheader: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#2D3748',
  },
  keyInput: {
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    fontSize: 16,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#72AEDE',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#ADCFED',
    fontSize: 11,
    marginTop: Spacing.xl,
    opacity: 0.8,
  },
});

export default ActivationScreen;
