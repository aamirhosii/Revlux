"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "./AppNavigator"
import axios from "axios"
import { API_URL, BOOKING_STATUS } from "../config"

export default function MyBookingsScreen({ navigation }) {
  const { user, token } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBookings = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/bookings/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      Alert.alert("Error", "Failed to load your bookings. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const onRefresh = () => {
    setRefreshing(true)
    fetchBookings()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return "#4CAF50" // Green
      case BOOKING_STATUS.REJECTED:
        return "#F44336" // Red
      default:
        return "#FFC107" // Amber for pending
    }
  }

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.serviceTypeContainer}>
          <Text style={styles.bookingDate}>{item.date}</Text>
          <Text style={styles.bookingTime}>{item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bookingDetails}>
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

      <View style={styles.addressContainer}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.addressText}>{item.address}</Text>
      </View>

      {item.status === BOOKING_STATUS.REJECTED && item.rejectionReason && (
        <View style={styles.rejectionContainer}>
          <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
          <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
        </View>
      )}

      <View style={styles.footerContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.total}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>You don't have any bookings yet</Text>
          <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate("Services")}>
            <Text style={styles.bookNowText}>BOOK A SERVICE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
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
    marginBottom: 24,
  },
  bookNowButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookNowText: {
    color: "#fff",
    fontWeight: "600",
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
  serviceTypeContainer: {
    flexDirection: "column",
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  rejectionContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  rejectionText: {
    fontSize: 14,
    color: "#333",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
})
