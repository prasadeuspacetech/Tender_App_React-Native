import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import useAuthStore from '../../store/useAuthStore';
import { Colors } from '../../theme';

/**
 * Redirects to Activation when there is no valid persisted session.
 * Wrap protected root screens (MainApp, GeneralCorrespondence).
 */
const AuthGate = ({ navigation, children }) => {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useFocusEffect(
    useCallback(() => {
      if (!hasHydrated) return;

      if (!useAuthStore.getState().isSessionValid()) {
        navigation.replace('Activation');
      }
    }, [hasHydrated, navigation]),
  );

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary ?? '#062E52'} />
      </View>
    );
  }

  if (!useAuthStore.getState().isSessionValid()) {
    return null;
  }

  return children;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgScreen ?? '#F5F5F5',
  },
});

export default AuthGate;
