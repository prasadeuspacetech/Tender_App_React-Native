// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActivationScreen from './src/screens/ActivationScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Activation"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Activation" 
          component={ActivationScreen} 
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
