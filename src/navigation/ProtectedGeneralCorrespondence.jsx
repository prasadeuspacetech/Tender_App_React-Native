import React from 'react';

import AuthGate from '../components/auth/AuthGate';
import GeneralCorrespondenceScreen from '../screens/GeneralCorrespondence/GeneralCorrespondenceScreen';

const ProtectedGeneralCorrespondence = ({ navigation }) => (
  <AuthGate navigation={navigation}>
    <GeneralCorrespondenceScreen />
  </AuthGate>
);

export default ProtectedGeneralCorrespondence;
