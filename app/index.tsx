import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import RootNavigator from '../src/navigation/RootNavigator';
import { initDatabase } from '../src/db/database';
import { initI18n } from '../src/i18n';
import { configureIosEdgeToEdge } from '../src/navigation/configureIosEdgeToEdge';

export default function Page() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([initDatabase(), initI18n()])
      .then(() => {
        configureIosEdgeToEdge();
        setReady(true);
      })
      .catch((error) => {
        console.error('[App] Startup failed:', error);
        // Still allow app to render — screens handle missing DB / i18n gracefully
        configureIosEdgeToEdge();
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#062E52" />
      </View>
    );
  }

  return <RootNavigator />;
}