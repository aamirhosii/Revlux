import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import HomeScreen from './HomeScreen';
import AboutScreen from './AboutScreen';
import DetailingScreen from './DetailingScreen';
import CoatingScreen from './CoatingScreen';
import ServicesScreen from './ServicesScreen';
import BookingScreen from './BookingScreen';
import AddOn from './AddOn';


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#F5C518',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Shelby Auto Detailing' }} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: 'About Us' }} />
        <Stack.Screen name="Detailing" component={DetailingScreen} options={{ title: 'Mobile Detailing' }} />
        <Stack.Screen name="Coating" component={CoatingScreen} options={{ title: 'Ceramic Coating' }} />
        <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Our Services' }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
        <Stack.Screen name="AddOn" component={AddOn} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}