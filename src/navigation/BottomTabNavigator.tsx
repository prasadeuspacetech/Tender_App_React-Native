import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../theme';

import DashboardScreen   from '../screens/Dashboard/DashboardScreen';
import WorksScreen       from '../screens/Works/WorksScreen';
import WorkflowNavigator from './WorkflowNavigator';   // ← replaces AddWorkScreen
import ReportsScreen     from '../screens/Reports/ReportsScreen';
import SettingsScreen    from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_BAR_BG = Colors.primary ?? '#062E52';

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
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
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: TAB_BAR_BG,
          borderTopWidth: 0,
          elevation: 8,
        },
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
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen name="Works" component={WorksScreen} options={{ tabBarLabel: 'Work' }} />
      <Tab.Screen
        name="Add Work"
        component={WorkflowNavigator}
        options={{ tabBarLabel: 'Add work' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Report', headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Setting' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;