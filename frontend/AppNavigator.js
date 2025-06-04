// AppNavigator.js

"use client"
import { createContext, useState, useEffect, useContext } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from 'axios' // Import axios
import { API_URL } from '../config' // Import API_URL from config

// -- Import all your screens here --
import LoginScreen from "./LoginScreen"
import SignupScreen from "./SignupScreen"
import HomeScreen from "./HomeScreen"
import ProfileScreen from "./ProfileScreen"
import ServicesScreen from "./ServicesScreen"
import ContactScreen from "./ContactScreen"
import LogoutScreen from "./LogoutScreen"
import AdminPanel from "./AdminPanel"
import GiftCardAdmin from "./GiftCardAdmin"
import MyBookingsScreen from "./MyBookingsScreen"
import ReferFriendScreen from "./ReferFriendScreen"
import GiftCardScreen from "./GiftCardScreen"
import ForgotPasswordScreen from "./ForgotPasswordScreen"
import AdminBookingsScreen from "./AdminBookingsScreen"
// Employee screens
import EmployeeDashboardScreen from "./EmployeeDashboardScreen"
import EmployeeAssignedJobsScreen from "./EmployeeAssignedJobsScreen"

// Placeholder screens (if you still need them)
const RewardsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text>Rewards Screen</Text>
  </View>
)

const SupportScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text>Support Screen</Text>
  </View>
)

// -------------------------------------------------
// AuthContext & AuthProvider
// -------------------------------------------------
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Start true so we show loader initially
  const [isClockedIn, setIsClockedIn] = useState(false) // Employee clock-in state
  const [lastClockInTime, setLastClockInTime] = useState(null)

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token")
        const storedUser = await AsyncStorage.getItem("user")

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(parsedUser)
          
          if (parsedUser.isEmployee) {
            // Fetch initial clock-in status for employee
            try {
              const response = await axios.get(`${API_URL}/api/employee/status`, {
                headers: { Authorization: `Bearer ${storedToken}` }
              })
              setIsClockedIn(response.data.isClockedIn)
              setLastClockInTime(response.data.lastClockInTime)
            } catch (statusError) {
              console.error("Error fetching employee clock-in status:", statusError)
              // If status check fails, assume clocked out to be safe
              setIsClockedIn(false)
            }
          }
        }
      } catch (error) {
        console.error("Error loading stored data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStoredData()
  }, [])

  const signIn = async (newToken, newUser) => {
    setIsLoading(true)
    try {
      setToken(newToken)
      setUser(newUser)
      await AsyncStorage.setItem("token", newToken)
      await AsyncStorage.setItem("user", JSON.stringify(newUser))
      
      if (newUser.isEmployee) {
        setIsClockedIn(newUser.isClockedIn || false) // Initial status from login
        setLastClockInTime(newUser.lastClockInTime || null)
      } else {
        setIsClockedIn(false)
        setLastClockInTime(null)
      }
    } catch (error) {
      console.error("Error signing in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // If employee is clocked in, attempt to clock them out on sign out
      if (user && user.isEmployee && isClockedIn && token) {
        try {
          await axios.post(`${API_URL}/api/employee/clock-out`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log("Auto-clocked out on sign out.")
        } catch (clockOutError) {
          console.error("Error auto-clocking out on sign out:", 
            clockOutError.response?.data?.message || clockOutError.message)
          // Sign out even if clock-out fails
        }
      }

      setToken(null)
      setUser(null)
      setIsClockedIn(false)
      setLastClockInTime(null)
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateClockInStatus = (status, time) => {
    setIsClockedIn(status)
    setLastClockInTime(time)
    // Update in context and AsyncStorage if needed
    if (user) {
      const updatedUser = { ...user, isClockedIn: status, lastClockInTime: time }
      setUser(updatedUser)
      AsyncStorage.setItem("user", JSON.stringify(updatedUser))
        .catch(e => console.error("Failed to update user in storage:", e))
    }
  }

  const value = {
    token,
    user,
    isLoading,
    isClockedIn,      // Clock-in state
    lastClockInTime,  // Last clock-in time
    signIn,
    signOut,
    updateClockInStatus // Update clock-in status
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// -------------------------------------------------
// Navigation Setup
// -------------------------------------------------
const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

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
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={32} color="#000000" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Shelby Auto Detailing" }} />
    </Stack.Navigator>
  )
}

/** ServicesStack - separate stack for services flow. */
function ServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: false }} />
      {/* AdminBookings should ideally be part of an Admin specific stack */}
    </Stack.Navigator>
  )
}

/** DrawerNavigator - the side menu. Consumes AuthContext to show/hide Admin stuff. */
function DrawerNavigator({ navigation }) {
  const { signOut, user } = useContext(AuthContext)

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
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.navigate("MainStack", { screen: "Home" });
          },
        }}
      />

      {/* Common Screens for all logged-in users */}
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          drawerIcon: ({color, size}) => <Ionicons name="person-outline" size={size} color={color} /> 
        }} 
      />
      
      <Drawer.Screen 
        name="ServicesNav" 
        component={ServicesStack} 
        options={{ 
          title:"Our Services", 
          headerShown: false, 
          drawerIcon: ({color, size}) => <Ionicons name="car-outline" size={size} color={color} /> 
        }} 
      />
      
      <Drawer.Screen 
        name="My Bookings" 
        component={MyBookingsScreen} 
        options={{
          drawerIcon: ({color, size}) => <Ionicons name="calendar-outline" size={size} color={color} />
        }} 
      />
      
      <Drawer.Screen 
        name="Refer a Friend" 
        component={ReferFriendScreen} 
        options={{
          drawerIcon: ({color, size}) => <Ionicons name="share-social-outline" size={size} color={color} />
        }} 
      />
      
      <Drawer.Screen 
        name="Gift Card" 
        component={GiftCardScreen} 
        options={{
          drawerIcon: ({color, size}) => <Ionicons name="gift-outline" size={size} color={color} />
        }} 
      />
      
      {/* <Drawer.Screen 
        name="Rewards" 
        component={RewardsScreen} 
        options={{
          drawerIcon: ({color, size}) => <Ionicons name="star-outline" size={size} color={color} />
        }} 
      /> */}
      
      <Drawer.Screen 
        name="Contact" 
        component={ContactScreen} 
        options={{
          title:"Contact Us", 
          drawerIcon: ({color, size}) => <Ionicons name="call-outline" size={size} color={color} />
        }} 
      />

      {/* Employee Specific Screens */}
      {user?.isEmployee && (
        <>
          <Drawer.Screen
            name="EmployeeDashboard"
            component={EmployeeDashboardScreen}
            options={{
              title: "Employee Dashboard",
              drawerIcon: ({ color, size }) => <Ionicons name="speedometer-outline" size={size} color={color} />
            }}
          />
          <Drawer.Screen
            name="EmployeeAssignedJobs"
            component={EmployeeAssignedJobsScreen}
            options={{
              title: "My Assigned Jobs",
              drawerIcon: ({ color, size }) => <Ionicons name="list-circle-outline" size={size} color={color} />
            }}
          />
        </>
      )}

      {/* Admin Specific Screens */}
      {user?.isAdmin && (
        <>
          <Drawer.Screen
            name="AdminBookings"
            component={AdminBookingsScreen}
            options={{
              title: "Manage All Bookings",
              drawerIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />
            }}
          />
          <Drawer.Screen
            name="GiftCardAdmin"
            component={GiftCardAdmin}
            options={{
              title: "Issue Gift Cards",
              drawerIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />
            }}
          />
          <Drawer.Screen
            name="AdminPanel"
            component={AdminPanel}
            options={{
              title: "Admin Settings",
              drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
            }}
          />
        </>
      )}
      
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            signOut();
          },
        }}
      />
    </Drawer.Navigator>
  )
}

/**
 * InnerNavigation
 * - This is where we actually use the AuthContext to decide whether to show
 *   the DrawerNavigator (logged in) or the Auth Stack (Login/Signup).
 */
function InnerNavigation() {
  const { token, isLoading, user } = useContext(AuthContext)

  // Show loading spinner while verifying token/user data
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {token ? (
        // If we have a token, show main drawer
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainAppDrawer" component={DrawerNavigator} />
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
  )
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
  )
}

// -- STYLES --
const styles = StyleSheet.create({
  menuButton: { 
    marginLeft: 15, 
    padding: 5 
  },
  placeholderScreen: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFFFFF" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  },
})