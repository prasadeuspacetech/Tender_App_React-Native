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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../services/firebase';

// Theme constants (matching your existing theme)
const Colors = {
  primary: '#062E52',
  surface: '#FFFFFF',
  textInverse: '#FFFFFF',
  textPlaceholder: '#9CA3AF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

const ActivationScreen = () => {
  const navigation = useNavigation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [subscriptionKey, setSubscriptionKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if subscription is expired
  const isSubscriptionExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  // Format remaining time
  const getRemainingTime = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return { expired: true, text: 'Expired' };
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return { expired: false, text: `${diffDays} day${diffDays > 1 ? 's' : ''} left` };
    if (diffHours > 0) return { expired: false, text: `${diffHours} hour${diffHours > 1 ? 's' : ''} left` };
    if (diffMins > 0) return { expired: false, text: `${diffMins} minute${diffMins > 1 ? 's' : ''} left` };
    return { expired: false, text: 'Less than a minute left' };
  };

  const handleMobileChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobileNumber(numeric);
  };

  const handleActivate = async () => {
    // Validation
    if (mobileNumber.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!subscriptionKey || subscriptionKey.length !== 15) {
      Alert.alert('Invalid Key', 'Please enter a valid 15-character access key');
      return;
    }
    
    setLoading(true);
    
    try {
      // Query user by mobile number from Firebase
      const snapshot = await db.ref('users')
        .orderByChild('mobile')
        .equalTo(mobileNumber)
        .once('value');
      
      const users = snapshot.val();
      
      if (!users) {
        Alert.alert('Error', 'No account found with this mobile number');
        setLoading(false);
        return;
      }
      
      // Get the user (first match)
      const userId = Object.keys(users)[0];
      const user = users[userId];
      
      // Verify subscription key
      if (!user.subscription || user.subscription.key !== subscriptionKey) {
        Alert.alert('Error', 'Invalid access key');
        setLoading(false);
        return;
      }
      
      // Check if expired
      if (isSubscriptionExpired(user.subscription.expiresAt)) {
        Alert.alert(
          'Subscription Expired',
          'Your access has expired. Please contact your administrator to renew.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      // Calculate remaining time
      const remaining = getRemainingTime(user.subscription.expiresAt);
      
      // Navigate to Main App with user data
      navigation.replace('MainApp', {
        userData: user,
        subscription: user.subscription,
        remainingTime: remaining.text,
      });
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Tender Portal</Text>
          <Text style={styles.subtitle}>Enter your credentials to access tenders</Text>

          {/* Mobile Number Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={handleMobileChange}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor={Colors.textPlaceholder}
              editable={!loading}
              returnKeyType="next"
            />
          </View>

          {/* Access Key Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Access Key</Text>
            <TextInput
              style={styles.input}
              value={subscriptionKey}
              onChangeText={setSubscriptionKey}
              placeholder="15-character access key"
              autoCapitalize="characters"
              maxLength={15}
              placeholderTextColor={Colors.textPlaceholder}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleActivate}
            />
          </View>

          {/* Activate Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleActivate}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Access Tenders</Text>
            )}
          </TouchableOpacity>

          {/* Hint Text */}
          <Text style={styles.hint}>
            Enter the 15-character key provided by your administrator
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: Colors.textPlaceholder,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ActivationScreen;