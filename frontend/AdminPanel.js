"use client"

// AdminPanel.js
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { API_URL } from "../config"


// Minimum durations (in minutes) for each service
const SERVICE_DURATIONS = {
  CORE: 90,
  PRO: 120,
  ULTRA: 180,
  SAPPHIRE: 360,
  EMERALD: 440,
  DIAMOND: 550,
}

// Helper: parse "HH:MM" into total minutes from midnight
function parseTimeToMinutes(timeStr) {
  // e.g. "10:00" -> [10, 0] -> 600
  const [hh, mm] = timeStr.split(":").map(Number)
  return hh * 60 + mm
}

// Helper: convert total minutes back to "HH:MM"
function formatMinutesToTime(minutes) {
  const hh = Math.floor(minutes / 60)
  const mm = minutes % 60
  // zero-pad the hours and minutes
  const hhStr = String(hh).padStart(2, "0")
  const mmStr = String(mm).padStart(2, "0")
  return `${hhStr}:${mmStr}`
}

// Our 6 service types
const SERVICE_TYPES = ["CORE", "PRO", "ULTRA", "SAPPHIRE", "EMERALD", "DIAMOND"]

// Tabs for the admin panel
const TABS = {
  AVAILABILITY: "AVAILABILITY",
  USERS: "USERS",
  BOOKINGS: "BOOKINGS", // New tab for bookings
}

export default function AdminPanel() {
  // Availability state
  const [date, setDate] = useState("")
  const [allSlots, setAllSlots] = useState([])
  const [startTime, setStartTime] = useState("")
  const [selectedService, setSelectedService] = useState("CORE")
  const [allAvailability, setAllAvailability] = useState([])
  const isEmployee = (user) => {
    return user && (user.role === "employee" || user.isEmployee === true);
  };

  // User management state
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    isAdmin: false,
    isEmployee: false,
    carInfo: "",
    homeAddress: "",
    referralCredits: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // Bookings state
  const [bookings, setBookings] = useState([])
  const [bookingFilter, setBookingFilter] = useState("pending") // pending, confirmed, all
  const [debugInfo, setDebugInfo] = useState({})

  // Employee assignment state
  const [assignEmployeeModalVisible, setAssignEmployeeModalVisible] = useState(false)
  const [employeesList, setEmployeesList] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [currentBookingId, setCurrentBookingId] = useState(null)

  // Active tab state
  const [activeTab, setActiveTab] = useState(TABS.BOOKINGS)

  useEffect(() => {
    if (activeTab === TABS.AVAILABILITY) {
      fetchAllAvailability()
    } else if (activeTab === TABS.USERS) {
      fetchUsers()
    } else if (activeTab === TABS.BOOKINGS) {
      fetchBookings()
    }
  }, [activeTab])

  // Fetch all availability data
  const fetchAllAvailability = async () => {
    try {
      const response = await axios.get("http://localhost:5001/availability")
      setAllAvailability(response.data)
    } catch (error) {
      console.error("Error fetching availability", error)
      Alert.alert("Error", "Failed to fetch availability")
    }
  }

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await axios.get(`${API_URL}/users`, {
        params: { role: "employee" },
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filter users to only include employees
      const employeeUsers = response.data.users.filter(user => 
        user.role === "employee" || user.isEmployee === true
      )
      setEmployeesList(employeeUsers)
    } catch (error) {
      console.error("Error fetching employees:", error)
      Alert.alert("Error", "Failed to fetch employees")
    }
  }

  // Fetch users with optional search query
  const fetchUsers = async (page = 1, search = searchQuery) => {
    setIsLoading(true)
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await axios.get("http://localhost:5001/users", {
        params: { search, page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Error fetching users:", error)
      Alert.alert("Error", "Failed to fetch users")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

   // Fetch bookings with improved logging and debugging
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setDebugInfo(prev => ({
          ...prev,
          error: "No authentication token found",
          status: "401"
        }));
        setBookings([]);
        setIsLoading(false);
        return;
      }
  
      // IMPORTANT: Change to use the admin endpoint instead of regular endpoint
      console.log("Fetching bookings from:", `${API_URL}/api/bookings/admin`);
      console.log("Token starts with:", token.substring(0, 15) + "...");
      
      const response = await axios.get(`${API_URL}/api/bookings/admin`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });
      
      console.log(`Found ${response.data.length} bookings from API`);
      
      // Add detailed per-booking logging to diagnose issues
      if (response.data.length > 0) {
        console.log("First few bookings:");
        response.data.slice(0, 3).forEach((booking, index) => {
          console.log(`Booking ${index + 1}:`, {
            id: booking._id,
            customer: booking.customerName,
            status: booking.status,
            user: booking.user,
            createdAt: booking.createdAt
          });
        });
      } else {
        console.log("No bookings returned from API");
      }
      
      setBookings(response.data);
      setDebugInfo(prev => ({
        ...prev,
        bookingsFetched: true,
        count: response.data.length,
        lastFetch: new Date().toLocaleTimeString(),
        error: null
      }));
    } catch (error) {
      console.error("Error fetching bookings:", error);
      
      let errorMessage = "Failed to fetch bookings";
      let statusCode = error.response?.status || "Unknown";
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
        statusCode = error.response.status;
      } else if (error.request) {
        errorMessage = "No response from server";
        console.error("No response received");
      } else {
        errorMessage = error.message;
      }
      
      setDebugInfo(prev => ({
        ...prev,
        error: errorMessage,
        status: statusCode,
        request: `${API_URL}/api/bookings/admin`,
        tokenExists: !!token
      }));
      
      // Clear any existing bookings
      setBookings([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle search input change
  const handleSearch = (text) => {
    setSearchQuery(text)
    if (text.length === 0 || text.length > 2) {
      fetchUsers(1, text)
    }
  }

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true)
    if (activeTab === TABS.USERS) {
      fetchUsers(1)
    } else if (activeTab === TABS.BOOKINGS) {
      fetchBookings()
    }
  }

  // Load more users when scrolling to bottom
  const loadMoreUsers = () => {
    if (pagination.page < pagination.pages && !isLoading) {
      fetchUsers(pagination.page + 1)
    }
  }

  // Open edit modal for a user
  const openEditModal = (user) => {
    setSelectedUser(user)
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      isAdmin: user.isAdmin || false,
      isEmployee: user.role === "employee" || false,
      carInfo: user.carInfo || "",
      homeAddress: user.homeAddress || "",
      referralCredits: user.referralCredits || 0,
    })
    setEditModalVisible(true)
  }

  // Update user information
  const updateUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      
      // Create update payload with role based on isEmployee value
      const updatePayload = {
        ...userForm,
        role: userForm.isEmployee ? "employee" : "user"
      }
      
      await axios.put(`${API_URL}/users/${selectedUser._id}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      Alert.alert("Success", `User updated successfully${userForm.isEmployee ? " and assigned as Employee" : ""}`)
      setEditModalVisible(false)
      fetchUsers(pagination.page) // Refresh the user list
    } catch (error) {
      console.error("Error updating user:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to update user")
    }
  }

  // Toggle employee status directly from the user list
  const toggleEmployeeStatus = async (user) => {
    const newRole = user.role === "employee" ? "user" : "employee";
    const action = newRole === "employee" ? "assign as an employee" : "remove employee status from";
    
    Alert.alert(
      `${newRole === "employee" ? "Assign" : "Remove"} Employee Status`,
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.put(
                `${API_URL}/users/${user._id}`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              // Update local state to reflect changes immediately
              setUsers(prevUsers => 
                prevUsers.map(u => 
                  u._id === user._id ? { ...u, role: newRole } : u
                )
              );
              
              Alert.alert(
                "Success", 
                `${user.name} has been ${newRole === "employee" ? "assigned as an employee" : "removed from employee role"}.`
              );
            } catch (error) {
              console.error("Error updating employee status:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to update employee status"
              );
            }
          }
        }
      ]
    );
  };

  // Handle booking confirmation - showing employee selection modal
  const confirmBooking = async (bookingId, employeeIds = []) => {
  try {
    setIsLoading(true);
    
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Authentication required");
      return;
    }
    
    const response = await axios.put(
      `${API_URL}/api/bookings/${bookingId}/confirm`,
      { assignedEmployees: employeeIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("Booking confirmed:", response.data);
    
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === bookingId ? { 
          ...booking, 
          status: "confirmed",
          assignedEmployees: employeeIds
        } : booking
      )
    );
    
    Alert.alert("Success", "Booking confirmed and notification emails sent");
    // Refresh bookings
    fetchBookings();
  } catch (error) {
    console.error("Error confirming booking:", error);
    Alert.alert("Error", "Failed to confirm booking");
  } finally {
    setIsLoading(false);
  }
};

 // Function to assign employee and confirm booking
const assignEmployeeAndConfirm = async () => {
  if (!selectedEmployee) {
    Alert.alert("Error", "Please select an employee to assign");
    return;
  }
  
  try {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("token");
    
    console.log("Current booking ID:", currentBookingId);
    console.log("Selected employee:", selectedEmployee);
    
    // First update booking status to confirmed
    console.log("Updating booking status...");
    const statusUrl = `${API_URL}/api/bookings/${currentBookingId}/status`;
    const statusResponse = await axios.put(
      statusUrl,
      { status: "confirmed" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("Status update successful:", statusResponse.data);
    
    // Now try the employee assignment with the correct payload format for the assign-employees endpoint
    console.log("Assigning employee...");
    const assignUrl = `${API_URL}/api/bookings/${currentBookingId}/assign-employees`;
    console.log("Assignment URL:", assignUrl);
    
    // The key change is here - providing employeeIds as an array
    const assignResponse = await fetch(assignUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        employeeIds: [selectedEmployee._id] // Send as an array
      })
    });
    
    console.log("Assignment response status:", assignResponse.status);
    
    if (!assignResponse.ok) {
      const errorText = await assignResponse.text();
      console.error("Assignment failed. Status:", assignResponse.status, "Response:", errorText);
      throw new Error(`Assignment failed: ${assignResponse.status} ${errorText}`);
    }
    
    const assignData = await assignResponse.json();
    console.log("Assignment successful:", assignData);
    
    // Update local state
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === currentBookingId ? { 
          ...booking, 
          status: "confirmed",
          assignedEmployees: [selectedEmployee._id]
        } : booking
      )
    );

    Alert.alert("Success", `Booking confirmed and assigned to ${selectedEmployee.name}`);
    setAssignEmployeeModalVisible(false);
    setSelectedEmployee(null);
    setCurrentBookingId(null);
    
    // Refresh bookings
    fetchBookings();
  } catch (error) {
    console.error("Error in assignEmployeeAndConfirm:", error);
    
    let errorMessage = "Failed to assign employee.";
    if (error.response) {
      errorMessage = `Server error: ${error.response.status} ${error.response.data?.message || ''}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert("Error", errorMessage);
  } finally {
    setIsLoading(false);
  }
};
  // Reject booking
const rejectBooking = (bookingId) => {
  Alert.alert(
    "Reject Booking",
    "Are you sure you want to reject this booking?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async (reason = "") => {
          try {
            setIsLoading(true);
            
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              Alert.alert("Error", "Authentication required");
              return;
            }
            
            const response = await axios.put(
              `${API_URL}/api/bookings/${bookingId}/reject`,
              { reason },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );
            
            console.log("Booking rejected:", response.data);
            
            setBookings((prevBookings) =>
              prevBookings.map((booking) =>
                booking._id === bookingId ? { 
                  ...booking, 
                  status: "rejected",
                  rejectionReason: reason
                } : booking
              )
            );
            
            Alert.alert("Success", "Booking rejected and customer notified");
            // Refresh bookings
            fetchBookings();
          } catch (error) {
            console.error("Error rejecting booking:", error);
            Alert.alert("Error", "Failed to reject booking");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]
  );
};

  // This function auto-calculates the endTime based on startTime + serviceDuration
  const addTimeSlotToList = () => {
    if (!startTime) {
      Alert.alert("Missing fields", "Please provide start time.")
      return
    }
    // Parse the selected service's required duration in minutes
    const requiredMinutes = SERVICE_DURATIONS[selectedService] || 90

    // Convert "HH:MM" to total minutes
    const startMins = parseTimeToMinutes(startTime)

    // Calculate the end time by adding the required duration
    const endMins = startMins + requiredMinutes
    if (endMins > 24 * 60) {
      Alert.alert("Invalid Slot", "This time slot extends past midnight. Please choose another.")
      return
    }

    const computedEndTime = formatMinutesToTime(endMins)

    // Create a new slot
    const newSlot = {
      startTime,
      endTime: computedEndTime,
      serviceType: selectedService,
      isAvailable: true,
    }

    setAllSlots((prev) => [...prev, newSlot])
    // Reset the start time
    setStartTime("")
  }

  // Submit the entire set of time slots for a date
  const handleCreateAvailability = async () => {
    if (!date || allSlots.length === 0) {
      Alert.alert("Missing fields", "Please provide a date and at least one time slot.")
      return
    }
    try {
      const token = await AsyncStorage.getItem("token")
      // POST to backend: date, timeSlots
      await axios.post(
        "http://localhost:5001/availability",
        { date, timeSlots: allSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Alert.alert("Success", "Availability updated!")
      // reset local state
      setDate("")
      setAllSlots([])
      setStartTime("")
      setSelectedService("CORE")
      fetchAllAvailability()
    } catch (error) {
      console.error("Error creating availability", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to create availability")
    }
  }

  // Render a user item in the list
  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => openEditModal(item)}>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.badgesContainer}>
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
          {item.role === "employee" && (
            <View style={styles.employeeBadge}>
              <Text style={styles.adminBadgeText}>Employee</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userDetail}>
        <Ionicons name="mail-outline" size={16} color="#666" />
        <Text style={styles.userDetailText}>{item.email || "No email"}</Text>
      </View>

      <View style={styles.userDetail}>
        <Ionicons name="call-outline" size={16} color="#666" />
        <Text style={styles.userDetailText}>{item.phoneNumber || "No phone"}</Text>
      </View>

      {item.referralCode && (
        <View style={styles.userDetail}>
          <Ionicons name="share-social-outline" size={16} color="#666" />
          <Text style={styles.userDetailText}>Code: {item.referralCode}</Text>
        </View>
      )}

      <View style={styles.userActions}>
        <TouchableOpacity style={styles.userActionButton} onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={18} color="#000" />
          <Text style={styles.userActionText}>Edit</Text>
        </TouchableOpacity>
        
        {/* Quick action button to toggle employee status */}
        <TouchableOpacity 
          style={[
            styles.userActionButton, 
            item.role === "employee" ? styles.employeeActionButton : styles.regularActionButton
          ]} 
          onPress={() => toggleEmployeeStatus(item)}
        >
          <Ionicons 
            name={item.role === "employee" ? "person-remove-outline" : "person-add-outline"} 
            size={18} 
            color={item.role === "employee" ? "#fff" : "#000"} 
          />
          <Text style={[
            styles.userActionText, 
            item.role === "employee" ? styles.employeeActionText : {}
          ]}>
            {item.role === "employee" ? "Remove" : "Make Employee"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  // Render a booking item in the list
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.bookingDate}>
            {item.date} at {item.time}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === "confirmed"
              ? styles.confirmedBadge
              : item.status === "rejected"
                ? styles.rejectedBadge
                : styles.pendingBadge,
          ]}
        >
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>

        {item.assignedEmployee && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Assigned to: {item.assignedEmployee.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Services:</Text>
        {item.services.map((service, index) => (
          <Text key={index} style={styles.serviceItem}>
            • {service}
          </Text>
        ))}

        {item.addons && item.addons.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Add-ons:</Text>
            {item.addons.map((addon, index) => (
              <Text key={index} style={styles.serviceItem}>
                • {addon}
              </Text>
            ))}
          </>
        )}
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.total}</Text>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => rejectBooking(item._id)}
          >
            <Text style={styles.rejectButtonText}>REJECT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]} 
            onPress={() => confirmBooking(item._id)}
          >
            <Text style={styles.confirmButtonText}>CONFIRM & ASSIGN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  // Render the edit user modal
  const renderEditUserModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollContent}>
            <Text style={styles.formLabel}>Name</Text>
            <TextInput
              style={styles.formInput}
              value={userForm.name}
              onChangeText={(text) => setUserForm({ ...userForm, name: text })}
              placeholder="User's name"
            />

            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              value={userForm.email}
              onChangeText={(text) => setUserForm({ ...userForm, email: text })}
              placeholder="Email address"
              keyboardType="email-address"
            />

            <Text style={styles.formLabel}>Phone Number</Text>
            <TextInput
              style={styles.formInput}
              value={userForm.phoneNumber}
              onChangeText={(text) => setUserForm({ ...userForm, phoneNumber: text })}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.formLabel}>Car Information</Text>
            <TextInput
              style={styles.formInput}
              value={userForm.carInfo}
              onChangeText={(text) => setUserForm({ ...userForm, carInfo: text })}
              placeholder="Car make, model, year, etc."
            />

            <Text style={styles.formLabel}>Home Address</Text>
            <TextInput
              style={styles.formInput}
              value={userForm.homeAddress}
              onChangeText={(text) => setUserForm({ ...userForm, homeAddress: text })}
              placeholder="Home address"
              multiline={true}
              numberOfLines={3}
            />

            <Text style={styles.formLabel}>Referral Credits</Text>
            <TextInput
              style={styles.formInput}
              value={String(userForm.referralCredits)}
              onChangeText={(text) => setUserForm({ ...userForm, referralCredits: Number.parseInt(text) || 0 })}
              placeholder="Referral credits"
              keyboardType="numeric"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.formLabel}>Admin Status</Text>
              <TouchableOpacity
                style={[styles.toggleButton, userForm.isAdmin ? styles.toggleButtonActive : {}]}
                onPress={() => setUserForm({ ...userForm, isAdmin: !userForm.isAdmin })}
              >
                <Text style={userForm.isAdmin ? styles.toggleTextActive : styles.toggleText}>
                  {userForm.isAdmin ? "Admin" : "Regular User"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Added employee toggle */}
            <View style={styles.switchContainer}>
              <Text style={styles.formLabel}>Employee Status</Text>
              <TouchableOpacity
                style={[styles.toggleButton, userForm.isEmployee ? styles.toggleButtonActive : {}]}
                onPress={() => setUserForm({ ...userForm, isEmployee: !userForm.isEmployee })}
              >
                <Text style={userForm.isEmployee ? styles.toggleTextActive : styles.toggleText}>
                  {userForm.isEmployee ? "Employee" : "Regular User"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={updateUser}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  // Render the availability management tab
  const renderAvailabilityTab = () => (
    <>
      {/* CREATE AVAILABILITY SECTION */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={24} color="#000" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Create / Update Availability</Text>
        </View>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="e.g. 2025-03-01"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Select Service Type</Text>
        <View style={styles.pickerContainer}>
          {SERVICE_TYPES.map((serv) => (
            <TouchableOpacity
              key={serv}
              style={[styles.serviceTypeButton, selectedService === serv && styles.serviceTypeButtonActive]}
              onPress={() => setSelectedService(serv)}
            >
              <Text
                style={[styles.serviceTypeButtonText, selectedService === serv && styles.serviceTypeButtonTextActive]}
              >
                {serv}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Start Time (HH:MM) — e.g. "10:00"</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="10:00"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.addSlotButton} onPress={addTimeSlotToList}>
          <Ionicons name="add-outline" size={24} color="#fff" />
          <Text style={styles.addSlotButtonText}>Add Slot</Text>
        </TouchableOpacity>

        {/* Display the new slots to be added */}
        {allSlots.length > 0 && (
          <View style={styles.timeSlotsContainer}>
            <Text style={[styles.label, { marginBottom: 5 }]}>Time Slots to add:</Text>
            {allSlots.map((slot, idx) => (
              <Text key={idx} style={styles.slotItem}>
                • {slot.serviceType} {slot.startTime} - {slot.endTime}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateAvailability}>
          <Text style={styles.primaryButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </View>

      {/* EXISTING AVAILABILITY */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={24} color="#000" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Existing Availability</Text>
        </View>

        {allAvailability.map((avail) => {
          const dateStr = new Date(avail.date).toISOString().split("T")[0]
          return (
            <View key={avail._id} style={styles.availabilityItem}>
              <Text style={styles.availabilityDate}>{dateStr}</Text>
              {avail.timeSlots.map((ts, index) => (
                <Text key={index} style={styles.timeSlotText}>
                  {ts.serviceType}: {ts.startTime} - {ts.endTime} —{" "}
                  <Text style={{ color: ts.isAvailable ? "green" : "red" }}>
                    {ts.isAvailable ? "Available" : "Booked"}
                  </Text>
                </Text>
              ))}
            </View>
          )
        })}
      </View>
    </>
  )

  // Render the user management tab
  const renderUsersTab = () => (
    <>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={24} color="#000" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>User Management</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#888"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearSearch} onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.userList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={loadMoreUsers}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>{searchQuery ? "No users match your search" : "No users found"}</Text>
            }
            ListFooterComponent={
              pagination.page < pagination.pages ? (
                <ActivityIndicator size="small" color="#000" style={styles.footerLoader} />
              ) : null
            }
          />
        )}
      </View>
    </>
  )

  // Render the bookings management tab
  const renderBookingsTab = () => {
    // Filter bookings based on status
      
    const filteredBookings = bookings.filter((booking) => {
      if (bookingFilter === "all") return true;
      
      // Make case-insensitive comparison and handle null/undefined status
      const bookingStatus = (booking.status || "").toLowerCase();
      return bookingStatus === bookingFilter.toLowerCase();
    });

    return (
      <>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Manage Bookings</Text>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterTab, bookingFilter === "pending" && styles.activeFilterTab]}
              onPress={() => setBookingFilter("pending")}
            >
              <Text style={[styles.filterText, bookingFilter === "pending" && styles.activeFilterText]}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, bookingFilter === "confirmed" && styles.activeFilterTab]}
              onPress={() => setBookingFilter("confirmed")}
            >
              <Text style={[styles.filterText, bookingFilter === "confirmed" && styles.activeFilterText]}>
                Confirmed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, bookingFilter === "rejected" && styles.activeFilterTab]}
              onPress={() => setBookingFilter("rejected")}
            >
              <Text style={[styles.filterText, bookingFilter === "rejected" && styles.activeFilterText]}>
                Rejected
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, bookingFilter === "all" && styles.activeFilterTab]}
              onPress={() => setBookingFilter("all")}
            >
              <Text style={[styles.filterText, bookingFilter === "all" && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, bookingFilter === "debug" && styles.activeFilterTab]}
              onPress={() => setBookingFilter("debug")}
            >
              <Text style={[styles.filterText, bookingFilter === "debug" && styles.activeFilterText]}>Debug</Text>
            </TouchableOpacity>
          </View>

          {/* Bookings List */}
                                        // Replace the existing debug container section in the renderBookingsTab function with this:
                    {bookingFilter === "debug" ? (
                      <View style={styles.debugContainer}>
                        <Text style={styles.debugTitle}>API Debug Info</Text>
                        <Text style={styles.debugItem}>API URL: {API_URL}/api/bookings</Text>
                        <Text style={styles.debugItem}>Bookings Fetched: {String(debugInfo.bookingsFetched || false)}</Text>
                        <Text style={styles.debugItem}>Booking Count: {debugInfo.count || 0}</Text>
                        <Text style={styles.debugItem}>Last Fetch: {debugInfo.lastFetch || 'Never'}</Text>
                        <Text style={styles.debugItem}>Token Exists: {String(debugInfo.tokenExists || 'Unknown')}</Text>
                        
                        {debugInfo.message && (
                          <Text style={styles.debugItem}>Message: {debugInfo.message}</Text>
                        )}
                        
                        {debugInfo.error && (
                          <Text style={styles.debugItemError}>Error: {debugInfo.error}</Text>
                        )}
                        
                        <Text style={styles.debugItem}>Status Code: {debugInfo.status || 'N/A'}</Text>
                        
                        {/* Add viewing all bookings */}
                        {bookings.length > 0 && (
                          <View style={styles.allBookingsContainer}>
                            <Text style={styles.debugSubtitle}>All Retrieved Bookings ({bookings.length}):</Text>
                            <ScrollView style={{ maxHeight: 300 }}>
                              {bookings.map((booking, index) => (
                                <View key={index} style={styles.debugBookingItem}>
                                  <Text style={styles.debugBookingTitle}>
                                    {index + 1}. {booking.customerName} - {booking.status}
                                  </Text>
                                  <Text>ID: {booking._id}</Text>
                                  <Text>User: {booking.user || 'No user ID'}</Text>
                                  <Text>Date: {booking.date}</Text>
                                  <Text>Status: {booking.status}</Text>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                        
                        <View style={styles.debugButtonContainer}>
                          <TouchableOpacity style={styles.debugButton} onPress={fetchBookings}>
                            <Text style={styles.debugButtonText}>Refresh Bookings</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.debugButton, {backgroundColor: '#5856D6'}]} 
                            onPress={() => {
                              // Force show all bookings regardless of filter
                              setBookingFilter("all");
                              fetchBookings();
                            }}
                          >
                            <Text style={styles.debugButtonText}>Show All</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : isLoading && !refreshing ? (
                      <ActivityIndicator size="large" color="#000" style={styles.loader} />
                    ) : filteredBookings.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                          No {bookingFilter !== 'all' ? bookingFilter : ''} bookings found
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={filteredBookings}
                        renderItem={renderBookingItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.bookingList}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListFooterComponent={<View style={{ height: 20 }} />}
                      />
                    )}
        </View>
      </>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Admin Panel</Text>

      {/* Tab Navigation */}
      <View style={styles.tabNavigationContainer}>
        <Text style={styles.tabNavigationTitle}>Select a Tab</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.USERS && styles.activeTab]}
            onPress={() => setActiveTab(TABS.USERS)}
          >
            <Ionicons name="people" size={24} color={activeTab === TABS.USERS ? "#000" : "#666"} />
            <Text style={[styles.tabText, activeTab === TABS.USERS && styles.activeTabText]}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.AVAILABILITY && styles.activeTab]}
            onPress={() => setActiveTab(TABS.AVAILABILITY)}
          >
            <Ionicons name="calendar" size={24} color={activeTab === TABS.AVAILABILITY ? "#000" : "#666"} />
            <Text style={[styles.tabText, activeTab === TABS.AVAILABILITY && styles.activeTabText]}>Availability</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.BOOKINGS && styles.activeTab]}
            onPress={() => setActiveTab(TABS.BOOKINGS)}
          >
            <Ionicons name="book" size={24} color={activeTab === TABS.BOOKINGS ? "#000" : "#666"} />
            <Text style={[styles.tabText, activeTab === TABS.BOOKINGS && styles.activeTabText]}>Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content based on active tab */}
      {activeTab === TABS.AVAILABILITY ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{renderAvailabilityTab()}</ScrollView>
      ) : activeTab === TABS.USERS ? (
        <View style={styles.contentContainer}>{renderUsersTab()}</View>
      ) : (
        <View style={styles.contentContainer}>{renderBookingsTab()}</View>
      )}

      {/* Edit User Modal */}
      {renderEditUserModal()}

      {/* Employee Assignment Modal */}
      <Modal
        visible={assignEmployeeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAssignEmployeeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Employee</Text>
              <TouchableOpacity onPress={() => setAssignEmployeeModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent}>
              <Text style={styles.formLabel}>Select an employee to assign to this booking:</Text>
              
              {employeesList.length === 0 ? (
                <Text style={styles.emptyListText}>No employees available</Text>
              ) : (
                employeesList.map((employee) => (
                  <TouchableOpacity
                    key={employee._id}
                    style={[
                      styles.employeeItem,
                      selectedEmployee?._id === employee._id && styles.selectedEmployeeItem
                    ]}
                    onPress={() => setSelectedEmployee(employee)}
                  >
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                    {selectedEmployee?._id === employee._id && (
                      <Ionicons name="checkmark-circle" size={24} color="#000" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setAssignEmployeeModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.saveButton, 
                    !selectedEmployee && styles.disabledButton
                  ]} 
                  onPress={assignEmployeeAndConfirm}
                  disabled={!selectedEmployee}
                >
                  <Text style={styles.saveButtonText}>Confirm & Assign</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#000",
    textAlign: "center",
  },
  tabNavigationContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabNavigationTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#000",
    borderBottomWidth: 3,
    backgroundColor: "#f0f0f0",
  },
  tabText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  label: {
    fontWeight: "600",
    marginBottom: 5,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#000",
    backgroundColor: "#fff",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  serviceTypeButton: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  serviceTypeButtonActive: {
    backgroundColor: "#000",
  },
  serviceTypeButtonText: {
    color: "#000",
  },
  serviceTypeButtonTextActive: {
    color: "#fff",
  },
  addSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  addSlotButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  timeSlotsContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  slotItem: {
    color: "#333",
    marginBottom: 2,
  },
  primaryButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  availabilityItem: {
    backgroundColor: "#fafafa",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  availabilityDate: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
    color: "#000",
  },
  timeSlotText: {
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#000",
  },
  clearSearch: {
    padding: 5,
  },
  userList: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#000",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  adminBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  employeeBadge: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  userDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userDetailText: {
    marginLeft: 8,
    color: "#333",
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  userActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  userActionText: {
    marginLeft: 5,
    fontWeight: "500",
  },
  employeeActionButton: {
    backgroundColor: "#2196F3",
    marginLeft: 8,
  },
  regularActionButton: {
    backgroundColor: "#f0f0f0", 
    marginLeft: 8,
  },
  employeeActionText: {
    color: "#fff",
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontStyle: "italic",
  },
  loader: {
    marginTop: 20,
  },
  footerLoader: {
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalScrollContent: {
    padding: 15,
  },
  formLabel: {
    fontWeight: "600",
    marginBottom: 5,
    color: "#000",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  toggleButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#000",
  },
  toggleText: {
    color: "#666",
  },
  toggleTextActive: {
    color: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  // Booking styles
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: "#FFF8E1",
  },
  confirmedBadge: {
    backgroundColor: "#E8F5E9",
  },
  rejectedBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  bookingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  servicesContainer: {
    marginBottom: 15,
  },
  serviceItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 3,
    paddingLeft: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: "#000",
    marginLeft: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 15,
    marginTop: 5,
    flexWrap: "wrap",
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  activeFilterTab: {
    backgroundColor: "#000",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
  },
  bookingList: {
    paddingBottom: 20,
  },
  // Debug styles
  debugContainer: {
    padding: 20,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  debugItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  debugItemError: {
    fontSize: 14,
    color: '#cc0000',
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  debugButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  debugItemSuccess: {
    fontSize: 14,
    color: '#009900',
    marginBottom: 8,
    fontWeight: '600',
  },
  debugButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  // Employee assignment styles
  employeeItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedEmployeeItem: {
    backgroundColor: "#e0e0e0",
    borderColor: "#000",
    borderWidth: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  employeeEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  checkIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  // Add to your styles object
allBookingsContainer: {
  marginTop: 20,
  marginBottom: 10,
  borderTopWidth: 1,
  borderTopColor: '#ddd',
  paddingTop: 10,
},
debugSubtitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 10,
},
debugBookingItem: {
  backgroundColor: '#f8f8f8',
  padding: 10,
  borderRadius: 5,
  marginBottom: 8,
},
debugBookingTitle: {
  fontWeight: '600',
  marginBottom: 5,
},
  disabledButton: {
    backgroundColor: "#ccc",
  }

})