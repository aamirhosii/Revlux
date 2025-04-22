// ServicesStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ServicesScreen from './ServicesScreen';
import AdminBookingsScreen from './AdminBookingsScreen';

const Stack = createStackNavigator();

export default function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ title: 'Our Services', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="AdminBookings"
        component={AdminBookingsScreen}
        options={{ title: 'Pending Bookings', headerTitleAlign: 'center' }}
      />
    </Stack.Navigator>
  );
}