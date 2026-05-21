// src/navigation/SplashNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GradientSplashScreen from '../screens/splash/Gradientsplashscreen.jsx';
import LoaderSplashScreen   from '../screens/splash/Loadersplashscreen.jsx';

const Stack = createNativeStackNavigator();

// ---------------------------------------------------------------------------
// SplashNavigator owns only the two intro screens.
// Both screens are rendered with no header and no animation so they feel
// like native OS splash screens.
// RootNavigator switches away from this navigator to MainApp after the
// LoaderSplashScreen calls navigation.replace('MainApp').
// ---------------------------------------------------------------------------

const SplashNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',           // subtle cross-fade between splash screens
        gestureEnabled: false,       // no swipe-back on splash
      }}
    >
      <Stack.Screen name="SplashGradient" component={GradientSplashScreen} />
      <Stack.Screen name="SplashLoader"   component={LoaderSplashScreen}   />
    </Stack.Navigator>
  );
};

export default SplashNavigator;