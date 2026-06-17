import React from 'react';

import AuthGate from '../components/auth/AuthGate';
import BottomTabNavigator from './BottomTabNavigator';

const ProtectedMainApp = ({ navigation }) => (
  <AuthGate navigation={navigation}>
    <BottomTabNavigator />
  </AuthGate>
);

export default ProtectedMainApp;
