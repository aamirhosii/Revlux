// AppNavigator.js
import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import ServicesScreen from './ServicesScreen';
import AddOnsScreen from './AddOn';
import BookingScreen from './BookingScreen';
import ContactScreen from './ContactScreen';
import LogoutScreen from './LogoutScreen';
import AdminPanel from './AdminPanel';
import GiftCardAdmin from './GiftCardAdmin'; 

// MY Bookings
import MyBookingsScreen from './MyBookingsScreen';

// IMPORTANT: Import your ACTUAL screens
import ReferFriendScreen from './ReferFriendScreen';
import GiftCardScreen from './GiftCardScreen';
// (Remove the placeholder definitions entirely)

// If you still want placeholders for others:
const RewardsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text>Rewards Screen</Text>
  </View>
);
const SupportScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text>Support Screen</Text>
  </View>
);

export const AuthContext = createContext();

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#000000',
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
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

function ServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddOnsScreen"
        component={AddOnsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function DrawerNavigator({ navigation }) {
  const { signOut, user } = React.useContext(AuthContext);

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#000000',
        drawerInactiveTintColor: '#666666',
        drawerStyle: { backgroundColor: '#FFFFFF', width: 280 },
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
      }}
    >
      {/* HOME STACK */}
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
            navigation.navigate('Main', { screen: 'Home' });
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

      {/* SERVICES STACK */}
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

      {/* REAL ReferFriendScreen */}
      <Drawer.Screen
        name="Refer a Friend"
        component={ReferFriendScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="share-social-outline" size={size} color={color} />
          ),
        }}
      />

      {/* REAL GiftCardScreen */}
      <Drawer.Screen
        name="Gift Card"
        component={GiftCardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Admin-only GiftCardAdmin */}
      {user?.isAdmin && (
        <Drawer.Screen
          name="GiftCardAdmin"
          component={GiftCardAdmin}
          options={{
            title: 'Issue Gift Cards',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />
      )}

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

      {user?.isAdmin && (
        <Drawer.Screen
          name="AdminPanel"
          component={AdminPanel}
          options={{
            title: 'Admin Panel',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      )}

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
            signOut();
          },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  const authContext = {
    signIn: async (token, userObject) => {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userObject));
      setUserToken(token);
      setUser(userObject);
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUserToken(null);
      setUser(null);
    },
    user,
    userToken,
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
          setUserToken(token);
          setUser(JSON.parse(userStr));
        }
      } catch (e) {
        console.error('Failed to load token or user', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  if (isLoading) {
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
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={DrawerNavigator} />
          </Stack.Navigator>
        ) : (
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