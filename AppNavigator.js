import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import HomeScreen from './HomeScreen';
import AboutScreen from './AboutScreen';
import DetailingScreen from './DetailingScreen';
import CoatingScreen from './CoatingScreen';
import ServicesScreen from './ServicesScreen';
import BookingScreen from './BookingScreen';
import AddOnsScreen from './AddOn';

// Placeholder components for new drawer screens
const ProfileScreen = () => <View style={styles.placeholderScreen}><Text>Profile Screen</Text></View>;
const MyBookingsScreen = () => <View style={styles.placeholderScreen}><Text>My Bookings Screen</Text></View>;
const MyAccountScreen = () => <View style={styles.placeholderScreen}><Text>My Account Screen</Text></View>;
const ReferFriendScreen = () => <View style={styles.placeholderScreen}><Text>Refer a Friend Screen</Text></View>;
const GiftCardScreen = () => <View style={styles.placeholderScreen}><Text>Gift Card Screen</Text></View>;
const RewardsScreen = () => <View style={styles.placeholderScreen}><Text>Rewards Screen</Text></View>;
const SupportScreen = () => <View style={styles.placeholderScreen}><Text>Support Screen</Text></View>;

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <Ionicons name="menu-outline" size={32} color="#000000" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Shelby Auto Detailing' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Us' }} />
      <Stack.Screen name="Detailing" component={DetailingScreen} options={{ title: 'Mobile Detailing' }} />
      <Stack.Screen name="Coating" component={CoatingScreen} options={{ title: 'Ceramic Coating' }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
      <Stack.Screen name="AddOnsScreen" component={AddOnsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#000000',
        drawerInactiveTintColor: '#666666',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
        },
      }}
    >
      <Drawer.Screen 
        name="MainStack" 
        component={MainStack} 
        options={{
          title: 'Home',
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
       <Drawer.Screen 
    name="Services" 
    component={ServicesScreen}
    options={{
      title: 'Our Services',
      drawerIcon: ({ color, size }) => (
        <Ionicons name="car-outline" size={size} color={color} />
      ),
      headerShown: true, // Ensure the header is shown with menu button
    }}
  />
      <Drawer.Screen 
        name="My Bookings" 
        component={MyBookingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="My Account" 
        component={MyAccountScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Refer a Friend" 
        component={ReferFriendScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="share-social-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Gift Card" 
        component={GiftCardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Support" 
        component={SupportScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 15,
    padding: 5,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});