import { initializeApp } from 'firebase/app';
import { equalTo, get, getDatabase, orderByChild, query, ref } from 'firebase/database';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Firebase config (only for subscription)
const firebaseConfig = {
  apiKey: "AIzaSyAln62Yu3Hy9ILrqUpLGsxkbe6DXtSTVO0",
  authDomain: "subscription-system-tenderapp.firebaseapp.com",
  databaseURL: "https://subscription-system-tenderapp-default-rtdb.firebaseio.com",
  projectId: "subscription-system-tenderapp",
  storageBucket: "subscription-system-tenderapp.firebasestorage.app",
  messagingSenderId: "936772760561",
  appId: "1:936772760561:web:012d9540d051237d964a50"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PRIMARY_COLOR = '#062E52';

const ActivationScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMobileChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobile(cleaned);
  };

  const handleKeyChange = (text) => {
    const uppercased = text.toUpperCase().slice(0, 15);
    setAccessKey(uppercased);
  };

  const handleActivate = async () => {
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
      const usersRef = ref(db, 'users');
      const mobileQuery = query(usersRef, orderByChild('mobile'), equalTo(mobile));
      let snapshot = await get(mobileQuery);
      let usersData = snapshot.val();

      if (!usersData) {
        const formattedMobile = `91${mobile}`;
        const formattedQuery = query(usersRef, orderByChild('mobile'), equalTo(formattedMobile));
        snapshot = await get(formattedQuery);
        usersData = snapshot.val();
      }

      if (!usersData) {
        Alert.alert('Activation Failed', 'No account found with this mobile number.');
        setLoading(false);
        return;
      }

      const userId = Object.keys(usersData)[0];
      const user = usersData[userId];

      if (!user.subscription || user.subscription.key !== accessKey) {
        Alert.alert('Activation Failed', 'Invalid access key.');
        setLoading(false);
        return;
      }

      const expiresAt = new Date(user.subscription.expiresAt);
      const now = new Date();

      if (expiresAt <= now) {
        Alert.alert('Subscription Expired', 'Your subscription has expired. Please contact administrator.');
        setLoading(false);
        return;
      }

      setLoading(false);
      navigation.replace('Dashboard', {
        userData: {
          id: userId,
          name: user.name || 'User',
          mobile: user.mobile,
          email: user.email || '',
        },
        subscription: {
          key: user.subscription.key,
          expiresAt: user.subscription.expiresAt,
        }
      });

    } catch (error) {
      console.error('Activation Error:', error);
      Alert.alert('System Error', 'Could not complete activation. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>TENDER PRO</Text>
            <Text style={styles.brandSubtitle}>Subscription Portal</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>Activate Access</Text>
            <Text style={styles.cardSubheader}>
              Enter your registered mobile number and access key.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="9876543210"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={10}
                value={mobile}
                onChangeText={handleMobileChange}
                editable={!loading}
              />
            </View>

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

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleActivate} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Activate App</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>Secured by Tender Subscription System</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY_COLOR },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  brandTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  brandSubtitle: { fontSize: 14, color: '#ADCFED', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '100%', alignSelf: 'center', maxWidth: 440 },
  cardHeader: { fontSize: 22, fontWeight: '700', color: PRIMARY_COLOR, textAlign: 'center', marginBottom: 8 },
  cardSubheader: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: PRIMARY_COLOR, marginBottom: 6, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#2D3748' },
  keyInput: { fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }), fontSize: 16, letterSpacing: 1 },
  button: { backgroundColor: PRIMARY_COLOR, borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#72AEDE', opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footerText: { textAlign: 'center', color: '#ADCFED', fontSize: 11, marginTop: 24, opacity: 0.8 },
});

export default ActivationScreen;