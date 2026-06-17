import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import SubscriptionExpiryHandler from './src/components/auth/SubscriptionExpiryHandler';
import { initDatabase } from './src/db/database';
import { initI18n } from './src/i18n';
import { configureIosEdgeToEdge } from './src/navigation/configureIosEdgeToEdge';
import { navigationRef } from './src/navigation/navigationRef';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Production app entry (expo/AppEntry → App.js).
 * React Navigation root — not expo-router file-based routing.
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([initDatabase(), initI18n()])
      .then(() => {
        configureIosEdgeToEdge();
        setReady(true);
      })
      .catch((error) => {
        console.error('[App] Startup failed:', error);
        configureIosEdgeToEdge();
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color="#062E52" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
      <SubscriptionExpiryHandler />
    </NavigationContainer>
  );
}
