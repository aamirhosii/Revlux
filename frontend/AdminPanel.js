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
}

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

  // Active tab state
  const [activeTab, setActiveTab] = useState(TABS.AVAILABILITY)

  useEffect(() => {
    if (activeTab === TABS.AVAILABILITY) {
      fetchAllAvailability()
    } else if (activeTab === TABS.USERS) {
      fetchUsers()
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
    fetchUsers(1)
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
        { headers: { Authorization: `Bearer ${token}` } },
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
        </View>
      </View>

      {/* Content based on active tab */}
      {activeTab === TABS.AVAILABILITY ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{renderAvailabilityTab()}</ScrollView>
      ) : (
        <View style={styles.contentContainer}>{renderUsersTab()}</View>
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
})
