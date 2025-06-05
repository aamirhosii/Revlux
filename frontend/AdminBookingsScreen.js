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
import SelectMultiple from 'react-native-select-multiple' // For employee selection

export default function AdminBookingsScreen({ navigation }) {
  const { user, token } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState(BOOKING_STATUS.PENDING)
  const [loading, setLoading] = useState(false)
  const [rejectionModal, setRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  
  // New state for employee assignment
  const [assignEmployeeModal, setAssignEmployeeModal] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [currentBookingForAssignment, setCurrentBookingForAssignment] = useState(null)

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

    
    
    fetchBookings()
  }, [user, navigation])

  // Load bookings when filter changes
  useEffect(() => {
    if (user?.isAdmin && filter !== "debug") {
      fetchBookings()
    }
  }, [filter, user?.isAdmin])

  
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
      
      // Process and populate employee names for display
      const populatedBookings = await Promise.all(filteredBookings.map(async booking => {
        if (booking.assignedEmployees && booking.assignedEmployees.length > 0) {
          if (typeof booking.assignedEmployees[0] === 'string') {
            // If these are just IDs, we need employee details
            try {
              const assignedEmpsDetails = await Promise.all(
                booking.assignedEmployees.map(empId => 
                  axios.get(`${API_URL}/users/${empId}`, { headers: { Authorization: `Bearer ${token}` } })
                  .then(res => res.data.name)
                  .catch(() => 'Unknown Employee')
                )
              );
              return { ...booking, assignedEmployeeNames: assignedEmpsDetails };
            } catch (e) {
              return { ...booking, assignedEmployeeNames: ['Error fetching names'] };
            }
          } else if (typeof booking.assignedEmployees[0] === 'object') {
            // If already populated objects
            return { ...booking, assignedEmployeeNames: booking.assignedEmployees.map(emp => emp.name) };
          }
        }
        return { ...booking, assignedEmployeeNames: [] };
      }));
      
      console.log(`Found ${filteredBookings.length} ${filter} bookings`)
      setBookings(populatedBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error.response?.data || error.message)
      Alert.alert("Error", "Failed to load bookings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch available employees for assignment
  const fetchAvailableEmployees = async () => {
    setLoadingEmployees(true);
    try {
      // This endpoint should return all employees available for assignment
      const response = await axios.get(`${API_URL}/bookings/list-employees-for-assignment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableEmployees(response.data.map(emp => ({ 
        label: `${emp.name} (${emp.email})`, 
        value: emp._id 
      })));
    } catch (error) {
      console.error("Error fetching employees:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load employees for assignment.");
      setAvailableEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Open modal to assign employees
  const openAssignEmployeeModal = (booking) => {
    setCurrentBookingForAssignment(booking);
    setSelectedBookingId(booking._id);
    fetchAvailableEmployees();
    
    // Pre-select currently assigned employees
    if (booking.assignedEmployees && booking.assignedEmployees.length > 0) {
      // When the modal opens, create a pre-selected list based on existing assignments
      setTimeout(() => {
        const currentAssignedIds = booking.assignedEmployees.map(emp => 
          typeof emp === 'object' ? emp._id : emp
        );
        
        const preselected = availableEmployees.filter(emp => 
          currentAssignedIds.includes(emp.value)
        );
        
        setSelectedEmployees(preselected);
      }, 500);
    } else {
      setSelectedEmployees([]);
    }
    
    setAssignEmployeeModal(true);
  };

  // Handle employee assignment submission
  const handleAssignEmployees = async () => {
    if (!selectedBookingId || !currentBookingForAssignment) return;
    setLoading(true);
    const employeeIdsToAssign = selectedEmployees.map(emp => emp.value);

    try {
      await axios.put(
        `${API_URL}/bookings/${selectedBookingId}/assign-employees`,
        { employeeIds: employeeIdsToAssign },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      Alert.alert("Success", "Employees assigned successfully.");
      setAssignEmployeeModal(false);
      fetchBookings(); // Refresh bookings to show updated assignments
    } catch (error) {
      console.error("Error assigning employees:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to assign employees.");
    } finally {
      setLoading(false);
      setCurrentBookingForAssignment(null);
      setSelectedEmployees([]);
    }
  };

  // Handle selection changes in the employee multi-select
  const onSelectionsChange = (selectedItems) => {
    setSelectedEmployees(selectedItems);
  };

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

              Alert.alert("Success", "Booking confirmed successfully. You can now assign employees.")
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

      {/* Display Assigned Employees */}
      <View style={styles.assignedEmployeesContainer}>
        <Text style={styles.sectionTitle}>Assigned Employees:</Text>
        {item.assignedEmployeeNames && item.assignedEmployeeNames.length > 0 ? (
          item.assignedEmployeeNames.map((name, index) => (
            <Text key={index} style={styles.assignedEmployeeText}>• {name}</Text>
          ))
        ) : (
          <Text style={styles.noAssignedEmployeeText}>None</Text>
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

      {item.status === BOOKING_STATUS.CONFIRMED && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.assignButton]} 
          onPress={() => openAssignEmployeeModal(item)}
        >
          <Ionicons name="person-add-outline" size={16} color="#fff" style={{marginRight: 5}}/>
          <Text style={styles.assignButtonText}>
            {item.assignedEmployees && item.assignedEmployees.length > 0 ? "RE-ASSIGN" : "ASSIGN EMPLOYEES"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
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
      </View>

      {/* Bookings List or Debug View */}
      {loading ? (
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

      {/* New Assign Employee Modal */}
      <Modal
        visible={assignEmployeeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAssignEmployeeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Employees</Text>
              <TouchableOpacity onPress={() => setAssignEmployeeModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {loadingEmployees ? (
                <ActivityIndicator size="large" color="#000" />
              ) : availableEmployees.length === 0 ? (
                <Text style={styles.emptyText}>No employees available for assignment.</Text>
              ) : (
                <SelectMultiple
                  items={availableEmployees}
                  selectedItems={selectedEmployees}
                  onSelectionsChange={onSelectionsChange} 
                />
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setAssignEmployeeModal(false)}>
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    (loading || loadingEmployees || selectedEmployees.length === 0) && styles.disabledButton
                  ]} 
                  onPress={handleAssignEmployees}
                  disabled={loading || loadingEmployees || selectedEmployees.length === 0}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>ASSIGN</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    marginTop: 20,
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
  disabledButton: {
    backgroundColor: "#ccc",
  },
  // New styles for employee assignment
  assignButton: {
    backgroundColor: '#1E88E5',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  assignedEmployeesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  assignedEmployeeText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 5,
    marginBottom: 3,
  },
  noAssignedEmployeeText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  }
})