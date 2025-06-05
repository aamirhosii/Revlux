import { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import axios from "axios";
import { AuthContext } from "./AppNavigator";
import { API_URL } from "../config";

export default function MyBookingsScreen() {
  const { token, user } = useContext(AuthContext);
  // Get socket from context, but provide a fallback in case it's undefined
  const { socket } = useContext(AuthContext) || {};
  
  const [PENDING, CONFIRMED, REJECTED] = ["pending", "confirmed", "rejected"];
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchBookings();
    
    // Only set up socket listener if socket exists
    if (socket) {
      socket.on("booking:updated", (updatedBooking) => {
        if (user && updatedBooking.user === (user.userId || user._id)) {
          setBookings(prevBookings => 
            prevBookings.map(booking => 
              booking._id === updatedBooking._id ? updatedBooking : booking
            )
          );
        }
      });
      
      return () => {
        socket.off("booking:updated");
      };
    }
  }, [token, user]);
  
  async function fetchBookings() {
  setLoading(true);
  try {
    console.log(`Fetching bookings for user: ${user?.userId || 'unknown'}`);
    // Use the new endpoint that doesn't conflict with /:id pattern
    console.log(`API URL: ${API_URL}/api/bookings/by-current-user`);
    
    const response = await axios.get(`${API_URL}/api/bookings/by-current-user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`Received ${response.data.length} bookings`);
    setBookings(response.data);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    
    // More detailed error logging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    
    Alert.alert("Error", "Failed to load your bookings. Please try again.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}
  
  function onRefresh() {
    setRefreshing(true);
    fetchBookings();
  }
  
  function renderBooking({ item }) {
    return (
      <View style={styles.bookingItem}>
        <Text style={styles.bookingDate}>{item.date} at {item.time}</Text>
        <Text style={[styles.bookingStatus, {
          backgroundColor: 
            item.status === 'confirmed' ? '#4CAF50' :
            item.status === 'pending' ? '#FFC107' :
            item.status === 'rejected' ? '#F44336' : '#9E9E9E'
        }]}>
          {item.status}
        </Text>
        <Text style={styles.serviceText}>
          {item.services && item.services.join(", ")}
        </Text>
        <Text style={styles.priceText}>${item.total}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No bookings found</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchBookings}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bookingStatus: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});