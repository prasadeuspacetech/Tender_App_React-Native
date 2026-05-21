import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import RootNavigator from '../src/navigation/RootNavigator';
import { initDatabase } from '../src/db/database';

export default function Page() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((error) => {
        console.error('[App] Database init failed:', error);
        // Still allow app to render — screens will handle missing DB gracefully
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