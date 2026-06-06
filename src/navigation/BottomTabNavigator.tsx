import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme';

import DashboardScreen   from '../screens/Dashboard/DashboardScreen';
import WorksScreen       from '../screens/Works/WorksScreen';
import WorkflowNavigator from './WorkflowNavigator';   // ← replaces AddWorkScreen
import ReportsScreen     from '../screens/Reports/ReportsScreen';
import SettingsScreen    from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_BAR_BG = Colors.primary ?? '#062E52';

const BottomTabNavigator = () => {
  const { t } = useTranslation('navigation');
  const insets = useSafeAreaInsets();

  const androidTabBarStyle = {
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: TAB_BAR_BG,
    borderTopWidth: 0,
    elevation: 8,
  };

  // iOS: do not pass safeAreaInsets to tab bar (0) so the bar sits on the physical
  // bottom edge; height + paddingBottom must include the home-indicator inset.
  const iosTabBarStyle = {
    height: 72 + insets.bottom,
    // Avoid double-counting the home-indicator inset: `height` already includes it.
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: TAB_BAR_BG,
    borderTopWidth: 0,
    elevation: 8,
  };

  return (
    <Tab.Navigator
      safeAreaInsets={
        Platform.OS === 'ios'
          ? { top: 0, right: 0, bottom: 0, left: 0 }
          : undefined
      }
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneContainerStyle: { backgroundColor: Colors.bgScreen },
        contentStyle: { backgroundColor: Colors.bgScreen },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.65)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 2,
        },
        tabBarAllowFontScaling: true,
        tabBarStyle:
          Platform.OS === 'ios' ? iosTabBarStyle : androidTabBarStyle,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          let iconSize = size;

          if (route.name === 'Dashboard') {
            iconName = 'grid-outline';
          } else if (route.name === 'Works') {
            iconName = 'briefcase-outline';
          } else if (route.name === 'Add Work') {
            iconName = 'add';
            iconSize = 28;
          } else if (route.name === 'Reports') {
            iconName = 'clipboard-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: t('tabs.dashboard') }}
      />
      <Tab.Screen
        name="Works"
        component={WorksScreen}
        options={{ tabBarLabel: t('tabs.works') }}
      />
      <Tab.Screen
        name="Add Work"
        component={WorkflowNavigator}
        options={{ tabBarLabel: t('tabs.addWork') }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarLabel: t('tabs.reports'), headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;