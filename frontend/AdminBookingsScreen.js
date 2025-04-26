"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "./AppNavigator"
import axios from "axios"
import { API_URL, BOOKING_STATUS } from "../config"

export default function AdminBookingsScreen({ navigation }) {
  const { user, token } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState(BOOKING_STATUS.PENDING)
  const [loading, setLoading] = useState(false)
  const [rejectionModal, setRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})

  // Check if user is admin, if not redirect to home
  useEffect(() => {
    console.log("------ ADMIN PANEL INIT -------")
    console.log("Current user:", JSON.stringify(user))
    console.log("Is admin?", user?.isAdmin)
    console.log("API URL:", API_URL)
    
    if (!user?.isAdmin) {
      Alert.alert("Access Denied", "You don't have permission to access this page.")
      navigation.navigate("Main", { screen: "Home" })
      return
    }

    setDebugInfo({
      apiUrl: API_URL,
      userEmail: user?.email || "No email",
      isAdmin: user?.isAdmin || false,
      tokenPreview: token ? `${token.substring(0, 15)}...` : "No token"
    })
    
    fetchBookings()
  }, [user, navigation])

  // Load bookings when filter changes
  useEffect(() => {
    if (user?.isAdmin && filter !== "debug") {
      fetchBookings()
    }
  }, [filter, user?.isAdmin])

  // Test API function for debugging
  const testAdminAPI = () => {
    console.log("Testing admin API directly")
    setDebugInfo(prev => ({...prev, testing: true}))
    
    fetch(`${API_URL}/bookings/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      console.log("Status:", response.status)
      setDebugInfo(prev => ({...prev, status: response.status}))
      return response.json()
    })
    .then(data => {
      console.log("Test API response:", JSON.stringify(data))
      if (Array.isArray(data)) {
        console.log(`Found ${data.length} bookings in test`)
        setDebugInfo(prev => ({
          ...prev, 
          testing: false, 
          results: `Found ${data.length} bookings`,
          data: JSON.stringify(data, null, 2).substring(0, 500) + '...'
        }))
        Alert.alert("API Test Result", `Found ${data.length} bookings`)
      } else {
        setDebugInfo(prev => ({
          ...prev, 
          testing: false, 
          results: "Response is not an array",
          data: JSON.stringify(data, null, 2)
        }))
      }
    })
    .catch(error => {
      console.error("Test API error:", error)
      setDebugInfo(prev => ({...prev, testing: false, error: error.toString()}))
      Alert.alert("API Test Error", error.toString())
    })
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      console.log("Fetching admin bookings from:", `${API_URL}/bookings/admin`)
      console.log("With token:", token?.substring(0, 20) + "...")
      
      const response = await axios.get(`${API_URL}/bookings/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
      
      console.log("Admin bookings response:", response.data)
      
      // Filter bookings based on status
      let filteredBookings = response.data
      if (filter !== "all" && filter !== "debug") {
        filteredBookings = response.data.filter((booking) => booking.status === filter)
      }
      
      console.log(`Found ${filteredBookings.length} ${filter} bookings`)
      setBookings(filteredBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error.response?.data || error.message)
      Alert.alert("Error", "Failed to load bookings. Please try again.")
    } finally {
      setLoading(false)
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
          onPress: async () => {
            setLoading(true)
            try {
              await axios.put(
                `${API_URL}/bookings/${bookingId}/status`,
                { status: BOOKING_STATUS.CONFIRMED },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              )

              // Update local state
              setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                  booking._id === bookingId ? { ...booking, status: BOOKING_STATUS.CONFIRMED } : booking,
                ),
              )

              Alert.alert("Success", "Booking confirmed successfully. The customer has been notified.")
              fetchBookings()
            } catch (error) {
              console.error("Error confirming booking:", error)
              Alert.alert("Error", "Failed to confirm booking. Please try again.")
            } finally {
              setLoading(false)
            }
          },
        },
      ],
    )
  }

  // Open rejection modal
  const openRejectionModal = (bookingId) => {
    setSelectedBookingId(bookingId)
    setRejectionReason("")
    setRejectionModal(true)
  }

  // Handle booking rejection
  const rejectBooking = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for rejection.")
      return
    }

    setLoading(true)
    try {
      await axios.put(
        `${API_URL}/bookings/${selectedBookingId}/status`,
        {
          status: BOOKING_STATUS.REJECTED,
          rejectionReason: rejectionReason.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === selectedBookingId
            ? { ...booking, status: BOOKING_STATUS.REJECTED, rejectionReason: rejectionReason.trim() }
            : booking,
        ),
      )

      setRejectionModal(false)
      Alert.alert("Success", "Booking rejected successfully. The customer has been notified.")
      fetchBookings()
    } catch (error) {
      console.error("Error rejecting booking:", error)
      Alert.alert("Error", "Failed to reject booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Render booking item
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
            item.status === BOOKING_STATUS.CONFIRMED
              ? styles.confirmedBadge
              : item.status === BOOKING_STATUS.REJECTED
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

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {item.status === BOOKING_STATUS.REJECTED && item.rejectionReason && (
        <View style={styles.rejectionContainer}>
          <Text style={styles.sectionTitle}>Rejection Reason:</Text>
          <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
        </View>
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.total}</Text>
      </View>

      {item.status === BOOKING_STATUS.PENDING && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => openRejectionModal(item._id)}
          >
            <Text style={styles.rejectButtonText}>REJECT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => confirmBooking(item._id)}
          >
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  // Debug view
  const renderDebugView = () => (
    <ScrollView style={styles.debugContainer}>
      <Text style={styles.debugTitle}>Admin Panel Debugging</Text>
      
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Configuration</Text>
        <Text style={styles.debugItem}>API URL: {debugInfo.apiUrl}/bookings/admin</Text>
        <Text style={styles.debugItem}>User Email: {debugInfo.userEmail}</Text>
        <Text style={styles.debugItem}>Is Admin: {String(debugInfo.isAdmin)}</Text>
        <Text style={styles.debugItem}>Token: {debugInfo.tokenPreview}</Text>
      </View>

      <View style={styles.debugActions}>
        <TouchableOpacity style={styles.debugButton} onPress={testAdminAPI}>
          <Text style={styles.debugButtonText}>
            {debugInfo.testing ? "Testing..." : "Test API Directly"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={fetchBookings}>
          <Text style={styles.debugButtonText}>Fetch Bookings Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.debugButton, {backgroundColor: '#cc0000'}]} 
          onPress={() => {
            console.log("CURRENT BOOKINGS:", JSON.stringify(bookings));
            Alert.alert("Current Bookings", `Count: ${bookings.length}`);
          }}
        >
          <Text style={styles.debugButtonText}>Show Current Bookings</Text>
        </TouchableOpacity>
      </View>

      {debugInfo.status && (
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>API Test Results</Text>
          <Text style={styles.debugItem}>Status Code: {debugInfo.status}</Text>
          {debugInfo.results && <Text style={styles.debugItem}>{debugInfo.results}</Text>}
          {debugInfo.error && <Text style={[styles.debugItem, {color: 'red'}]}>{debugInfo.error}</Text>}
        </View>
      )}
      
      {debugInfo.data && (
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>Response Data Preview</Text>
          <Text style={styles.debugCode}>{debugInfo.data}</Text>
        </View>
      )}
      
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Bookings State ({bookings.length})</Text>
        <Text style={styles.debugCode}>{JSON.stringify(bookings.slice(0, 1), null, 2)}</Text>
        {bookings.length > 1 && <Text style={styles.debugItem}>... and {bookings.length - 1} more</Text>}
      </View>
    </ScrollView>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
        <TouchableOpacity onPress={fetchBookings}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === BOOKING_STATUS.PENDING && styles.activeFilterTab]}
          onPress={() => setFilter(BOOKING_STATUS.PENDING)}
        >
          <Text style={[styles.filterText, filter === BOOKING_STATUS.PENDING && styles.activeFilterText]}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === BOOKING_STATUS.CONFIRMED && styles.activeFilterTab]}
          onPress={() => setFilter(BOOKING_STATUS.CONFIRMED)}
        >
          <Text style={[styles.filterText, filter === BOOKING_STATUS.CONFIRMED && styles.activeFilterText]}>
            Confirmed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === BOOKING_STATUS.REJECTED && styles.activeFilterTab]}
          onPress={() => setFilter(BOOKING_STATUS.REJECTED)}
        >
          <Text style={[styles.filterText, filter === BOOKING_STATUS.REJECTED && styles.activeFilterText]}>
            Rejected
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === "debug" && styles.activeFilterTab]}
          onPress={() => setFilter("debug")}
        >
          <Text style={[styles.filterText, filter === "debug" && styles.activeFilterText]}>Debug</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List or Debug View */}
      {filter === "debug" ? (
        renderDebugView()
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No {filter !== "all" ? filter : ""} bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRejectionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rejection Reason</Text>
              <TouchableOpacity onPress={() => setRejectionModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>
                Please provide a reason for rejecting this booking. This will be sent to the customer.
              </Text>

              <TextInput
                style={styles.reasonInput}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Enter rejection reason"
                multiline={true}
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setRejectionModal(false)}>
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={rejectBooking} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>SUBMIT</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexWrap: "wrap",
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 5,
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
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  serviceItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 3,
    paddingLeft: 5,
  },
  notesContainer: {
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
  },
  rejectionContainer: {
    marginBottom: 15,
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
  },
  rejectionText: {
    fontSize: 14,
    color: "#333",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  reasonInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  // Debug styles
  debugContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  debugTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  debugSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  debugSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  debugItem: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  debugActions: {
    marginBottom: 20,
  },
  debugButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  debugButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  debugCode: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    color: "#333",
  },
})