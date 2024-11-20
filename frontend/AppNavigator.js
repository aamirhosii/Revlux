// AppNavigator.js
import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Drawer and Tab Navigators
import { createDrawerNavigator } from '@react-navigation/drawer';

// React Native Components
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import HomeScreen from './HomeScreen';
import AboutScreen from './AboutScreen';
import DetailingScreen from './DetailingScreen';
import CoatingScreen from './CoatingScreen';
import ServicesScreen from './ServicesScreen';
import BookingScreen from './BookingScreen';
import AddOnsScreen from './AddOn';
import ContactScreen from './ContactScreen';
import LogoutScreen from './LogoutScreen';
import ProfileScreen from './ProfileScreen';

// Placeholder components for new drawer screens
const MyBookingsScreen = () => <View style={styles.placeholderScreen}><Text>My Bookings Screen</Text></View>;
const ReferFriendScreen = () => <View style={styles.placeholderScreen}><Text>Refer a Friend Screen</Text></View>;
const GiftCardScreen = () => <View style={styles.placeholderScreen}><Text>Gift Card Screen</Text></View>;
const RewardsScreen = () => <View style={styles.placeholderScreen}><Text>Rewards Screen</Text></View>;
const SupportScreen = () => <View style={styles.placeholderScreen}><Text>Support Screen</Text></View>;
const LogoutScreenComponent = () => <View style={styles.placeholderScreen}><Text>Logging out...</Text></View>; // We'll handle logout logic
// AsyncStorage for token management
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Shelby Auto Detailing' }}
      />
    </Stack.Navigator>
  );
}

// Services Stack
function ServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddOnsScreen" component={AddOnsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Drawer Navigator
function DrawerNavigator({ navigation }) {
  const { signOut } = React.useContext(AuthContext);

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
        listeners={{
          drawerItemPress: () => {
            // Navigate directly to the Home screen inside MainStack
            navigation.navigate('Main', {
              screen: 'Home',
            });
          },
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
        component={ServicesStack}
        options={{
          title: 'Our Services',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
          headerShown: true, 
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
        name="Booking"
        component={BookingScreen}
        options={{
          title: 'Make a Booking',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
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
        name="Contact"
        component={ContactScreen}
        options={{
          title: 'Contact Us',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="call-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          drawerItemPress: () => {
            signOut(); // Call the signOut function from AuthContext
          },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Authentication functions
  const authContext = {
    signIn: async (token) => {
      await AsyncStorage.setItem('token', token);
      setUserToken(token);
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      setUserToken(null);
    },
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    // Show a loading spinner while checking token
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {userToken ? (
          // User is logged in
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={DrawerNavigator} />
          </Stack.Navigator>
        ) : (
          // User is not logged in
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
