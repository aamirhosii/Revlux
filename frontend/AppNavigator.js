// AppNavigator.js

"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// -- Import all your screens here --
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import ServicesScreen from "./ServicesScreen";
import AddOnsScreen from "./AddOn";
import BookingScreen from "./BookingScreen";
import ContactScreen from "./ContactScreen";
import LogoutScreen from "./LogoutScreen";
import AdminPanel from "./AdminPanel";
import GiftCardAdmin from "./GiftCardAdmin";
import CheckoutScreen from "./CheckoutScreen";
import MyBookingsScreen from "./MyBookingsScreen";
import ReferFriendScreen from "./ReferFriendScreen";
import GiftCardScreen from "./GiftCardScreen";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
// Placeholder screens (if you still need them)
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

// -------------------------------------------------
// AuthContext & AuthProvider
// -------------------------------------------------
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start true so we show loader initially

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const signIn = async (newToken, newUser) => {
    setIsLoading(true);
    try {
      setToken(newToken);
      setUser(newUser);

      await AsyncStorage.setItem("token", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      setToken(null);
      setUser(null);

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    token,
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// -------------------------------------------------
// Navigation Setup
// -------------------------------------------------
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

/** MainStack - simple stack with Home. */
function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#FFFFFF", elevation: 0, shadowOpacity: 0 },
        headerTintColor: "#000000",
        headerTitleStyle: { fontWeight: "bold" },
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
        options={{ title: "Shelby Auto Detailing" }}
      />
    </Stack.Navigator>
  );
}

/** ServicesStack - separate stack for services flow. */
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
      <Stack.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{ title: "Checkout" }}
      />
    </Stack.Navigator>
  );
}

/** DrawerNavigator - the side menu. Consumes AuthContext to show/hide Admin stuff. */
function DrawerNavigator({ navigation }) {
  const { signOut, user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: "#000000",
        drawerInactiveTintColor: "#666666",
        drawerStyle: { backgroundColor: "#FFFFFF", width: 280 },
        drawerLabelStyle: { fontSize: 16, fontWeight: "600" },
      }}
    >
      <Drawer.Screen
        name="MainStack"
        component={MainStack}
        options={{
          title: "Home",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          drawerItemPress: () => {
            navigation.navigate("Main", { screen: "Home" });
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
          title: "Our Services",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
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
          title: "Make a Booking",
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

      {user?.isAdmin && (
        <Drawer.Screen
          name="GiftCardAdmin"
          component={GiftCardAdmin}
          options={{
            title: "Issue Gift Cards",
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
          title: "Contact Us",
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
            title: "Admin Panel",
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

/** 
 * InnerNavigation
 * - This is where we actually use the AuthContext to decide whether to show
 *   the DrawerNavigator (logged in) or the Auth Stack (Login/Signup).
 */
function InnerNavigation() {
  const { token, isLoading } = useContext(AuthContext);

  // Show loading spinner while verifying token/user data
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

    return (
    <NavigationContainer>
      {token ? (
        // If we have a token, show main drawer
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={DrawerNavigator} />
        </Stack.Navigator>
      ) : (
        // Otherwise, show login/signup
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

/**
 * AppNavigator (Default Export)
 * - Wraps the InnerNavigation in AuthProvider
 */
export default function AppNavigator() {
  return (
    <AuthProvider>
      <InnerNavigation />
    </AuthProvider>
  );
}

// -- STYLES --
const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 15,
    padding: 5,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});