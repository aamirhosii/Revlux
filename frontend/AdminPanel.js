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

// Mock data for bookings
const MOCK_BOOKINGS = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    date: "05/15/2025",
    time: "10:00 AM",
    address: "123 Main St, New York, NY 10001",
    services: ["Full Interior Detail ($189)"],
    addons: ["Pet Hair Removal ($29)"],
    total: 218,
    status: "pending",
    createdAt: "2025-04-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 987-6543",
    date: "05/16/2025",
    time: "2:30 PM",
    address: "456 Park Ave, New York, NY 10022",
    services: ["Full Exterior Detail ($159)", "Mini Interior Detail ($109)"],
    addons: ["Glass Ceramic Coating ($169)"],
    total: 437,
    status: "pending",
    createdAt: "2025-04-20T16:45:00Z",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "(555) 456-7890",
    date: "05/18/2025",
    time: "9:00 AM",
    address: "789 Broadway, New York, NY 10003",
    services: ["Emerald Ceramic Coating ($799)"],
    addons: [],
    total: 799,
    status: "pending",
    createdAt: "2025-04-21T09:15:00Z",
  },
  {
    id: "4",
    name: "Emily Wilson",
    email: "emily.w@example.com",
    phone: "(555) 234-5678",
    date: "05/20/2025",
    time: "1:00 PM",
    address: "321 5th Ave, New York, NY 10016",
    services: ["Mini Exterior Detail ($59)"],
    addons: ["Odor Removal ($89)"],
    total: 148,
    status: "pending",
    createdAt: "2025-04-21T11:30:00Z",
  },
  {
    id: "5",
    name: "David Lee",
    email: "david.l@example.com",
    phone: "(555) 876-5432",
    date: "05/22/2025",
    time: "11:30 AM",
    address: "654 Madison Ave, New York, NY 10065",
    services: ["Diamond Ceramic Coating ($999)"],
    addons: ["Glass Ceramic Coating ($169)"],
    total: 1168,
    status: "pending",
    createdAt: "2025-04-22T08:45:00Z",
  },
]

export default function AdminPanel() {
  // Availability state
  const [date, setDate] = useState("")
  const [allSlots, setAllSlots] = useState([])
  const [startTime, setStartTime] = useState("")
  const [selectedService, setSelectedService] = useState("CORE")
  const [allAvailability, setAllAvailability] = useState([])

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

  // Active tab state
  const [activeTab, setActiveTab] = useState(TABS.AVAILABILITY)

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

  // Fetch bookings
  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would fetch this data from your backend
      // For now, we'll use the mock data
      setBookings(MOCK_BOOKINGS)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      Alert.alert("Error", "Failed to fetch bookings")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

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
      await axios.put(`http://localhost:5001/users/${selectedUser._id}`, userForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      Alert.alert("Success", "User updated successfully")
      setEditModalVisible(false)
      fetchUsers(pagination.page) // Refresh the user list
    } catch (error) {
      console.error("Error updating user:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to update user")
    }
  }

  // Handle booking confirmation
  const confirmBooking = (bookingId) => {
    Alert.alert(
      "Confirm Booking",
      "Are you sure you want to confirm this booking? This will send a confirmation notification to the customer.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            // Update booking status
            const updatedBookings = bookings.map((booking) => {
              if (booking.id === bookingId) {
                return { ...booking, status: "confirmed" }
              }
              return booking
            })

            setBookings(updatedBookings)

            // In a real app, you would send a notification to the customer here
            Alert.alert("Booking Confirmed", "The customer has been notified about their confirmed booking.")
          },
        },
      ]
    )
  }

  // Handle booking rejection
  const rejectBooking = (bookingId) => {
    Alert.alert(
      "Reject Booking",
      "Are you sure you want to reject this booking? This will send a notification to the customer.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            // Update booking status
            const updatedBookings = bookings.map((booking) => {
              if (booking.id === bookingId) {
                return { ...booking, status: "rejected" }
              }
              return booking
            })

            setBookings(updatedBookings)

            // In a real app, you would send a notification to the customer here
            Alert.alert("Booking Rejected", "The customer has been notified about their rejected booking.")
          },
        },
      ]
    )
  }

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
        {item.isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
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
      </View>
    </TouchableOpacity>
  )

  // Render a booking item in the list
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.customerName}>{item.name}</Text>
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
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Services:</Text>
        {item.services.map((service, index) => (
          <Text key={index} style={styles.serviceItem}>
            • {service}
          </Text>
        ))}

        {item.addons.length > 0 && (
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
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => rejectBooking(item.id)}>
            <Text style={styles.rejectButtonText}>REJECT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={() => confirmBooking(item.id)}>
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
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
      if (bookingFilter === "all") return true
      return booking.status === bookingFilter
    })

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
              style={[styles.filterTab, bookingFilter === "all" && styles.activeFilterTab]}
              onPress={() => setBookingFilter("all")}
            >
              <Text style={[styles.filterText, bookingFilter === "all" && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
          </View>

          {/* Bookings List */}
          {isLoading && !refreshing ? (
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
    keyExtractor={(item) => item.id}
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
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
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
})