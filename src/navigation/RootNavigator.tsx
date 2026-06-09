// src/navigation/RootNavigator.js
//
// ─────────────────────────────────────────────────────────────────────────────
//  NAVIGATION FLOW
//
//    SplashGradient  (1 s)
//         ↓  replace
//    SplashLoader    (1.5 s spinner)
//         ↓  replace
//    Activation      (user enters mobile + subscription key)
//         ↓  replace  (on Activate App press)
//    MainApp         (BottomTabNavigator — Dashboard, Works, …)
//
//  All transitions use navigation.replace() so the back-stack stays clean.
//  Users can never swipe/press Back to return to a splash or activation screen.
//
//  Architecture note:
//    A flat root stack is used instead of a nested SplashNavigator.
//    This eliminates the need for navigation.getParent() cross-navigator calls
//    and keeps every replace() call simple and predictable.
// ─────────────────────────────────────────────────────────────────────────────

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import ActivationScreen from '../screens/splash/Activationscreen';
import GradientSplashScreen from '../screens/splash/Gradientsplashscreen';
import LoaderSplashScreen from '../screens/splash/Loadersplashscreen';
import BottomTabNavigator from './BottomTabNavigator';
import GeneralCorrespondenceScreen from '../screens/GeneralCorrespondence/GeneralCorrespondenceScreen';
import { Colors } from '../theme';

const Root = createNativeStackNavigator();

const RootNavigator = () => (
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <Root.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',         // smooth cross-fade between every screen
        gestureEnabled: false,          // no swipe-back anywhere in pre-auth flow
        contentStyle: { backgroundColor: Colors.bgScreen },
      }}
    >
      {/* ── Pre-auth / onboarding flow ──────────────────────────────────────── */}
      <Root.Screen name="SplashGradient" component={GradientSplashScreen} />
      <Root.Screen name="SplashLoader" component={LoaderSplashScreen} />
      <Root.Screen name="Activation" component={ActivationScreen} />

      {/* ── Main app ────────────────────────────────────────────────────────── */}
      <Root.Screen
        name="MainApp"
        component={BottomTabNavigator}
        options={
          Platform.OS === 'ios'
            ? {
                // Navy behind status-bar inset only — do not set statusBarStyle here;
                // ScreenLayout uses RN StatusBar, which requires UIViewControllerBasedStatusBarAppearance=NO.
                contentStyle: { backgroundColor: Colors.primary },
              }
            : undefined
        }
      />

      <Root.Screen
        name="GeneralCorrespondence"
        component={GeneralCorrespondenceScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Root.Navigator>
  </SafeAreaProvider>
);

export default RootNavigator;