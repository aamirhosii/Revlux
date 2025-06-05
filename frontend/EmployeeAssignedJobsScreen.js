"use client"

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import axios from 'axios';
import { AuthContext } from './AppNavigator';
import { API_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function EmployeeAssignedJobsScreen({ navigation }) {
  const { token, user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignedBookings = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching assigned jobs for employee ID: ${user?.userId}`);
      console.log(`Using API URL: ${API_URL}/api/employee/assigned-jobs`);
      
      // First try the 'assigned-jobs' endpoint
      try {
        const response = await axios.get(`${API_URL}/api/employee/assigned-jobs`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log(`Response status from assigned-jobs endpoint: ${response.status}`);
        console.log(`Received ${response.data.length} assigned bookings`);
        
        if (response.data.length > 0) {
          console.log('Sample booking:', JSON.stringify(response.data[0], null, 2));
        }
        
        setBookings(response.data);
        return;
      } catch (assignedJobsError) {
        console.warn("Error fetching from assigned-jobs endpoint:", 
          assignedJobsError.response?.status,
          assignedJobsError.response?.data);
          
        // If the assigned-jobs endpoint failed, try the bookings endpoint as fallback
        console.log("Trying fallback endpoint: /api/employee/bookings");
        
        const response = await axios.get(`${API_URL}/api/employee/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log(`Received ${response.data.length} bookings from fallback endpoint`);
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching assigned bookings:", 
        error.response?.status,
        error.response?.data || error.message);
      
      setError(error.response?.data?.message || error.message);
      Alert.alert("Error", "Failed to load assigned jobs. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user]);

  // Add direct query function to check what bookings are assigned to this employee
  const checkBookingsForEmployee = useCallback(async () => {
    try {
      console.log("Checking all bookings for employee assignments...");
      
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allBookings = response.data;
      console.log(`Found ${allBookings.length} total bookings in the system`);
      
      // Filter bookings to find any that include this employee ID in assignedEmployees
      const myAssignedBookings = allBookings.filter(booking => 
        booking.assignedEmployees && 
        booking.assignedEmployees.includes(user?.userId)
      );
      
      console.log(`Found ${myAssignedBookings.length} bookings assigned to employee ${user?.userId}`);
      
      if (myAssignedBookings.length > 0) {
        console.log("Assigned booking IDs:", myAssignedBookings.map(b => b._id));
      }
      
      // Update the state with these bookings as a fallback
      if (myAssignedBookings.length > 0 && bookings.length === 0) {
        console.log("Using directly filtered bookings instead");
        setBookings(myAssignedBookings);
      }
      
    } catch (error) {
      console.error("Error checking all bookings:", error);
    }
  }, [token, user, bookings.length]);

  useEffect(() => {
    fetchAssignedBookings();
    
    // If no assigned bookings are found, check manually after a short delay
    const timer = setTimeout(() => {
      if (bookings.length === 0) {
        checkBookingsForEmployee();
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [fetchAssignedBookings, checkBookingsForEmployee]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignedBookings();
  }, [fetchAssignedBookings]);

  // Handle booking status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#2196F3'; // Blue
      case 'pending': return '#FF9800'; // Orange
      case 'completed': return '#4CAF50'; // Green
      case 'pending_completion': return '#9C27B0'; // Purple
      case 'rejected': return '#F44336'; // Red
      default: return '#757575'; // Grey
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
         <Text style={styles.customerName}>{item.customerName}</Text>
         <Text style={[
           styles.bookingStatus, 
           { backgroundColor: getStatusColor(item.status) }
         ]}>
           {item.status}
         </Text>
      </View>
      <View style={styles.divider} />
      
      <View style={styles.detailRow}>
         <Ionicons name="calendar-outline" size={16} color="#555" />
         <Text style={styles.detailText}>{item.date} at {item.time}</Text>
      </View>
      <View style={styles.detailRow}>
         <Ionicons name="location-outline" size={16} color="#555" />
         <Text style={styles.detailText}>{item.address}</Text>
      </View>
      <View style={styles.detailRow}>
         <Ionicons name="person-outline" size={16} color="#555" />
         <Text style={styles.detailText}>
           Customer: {item.user?.name || item.customerName} ({item.phone})
         </Text>
      </View>

      <Text style={styles.sectionTitle}>Services:</Text>
      {item.services.map((service, index) => (
        <Text key={`service-${index}`} style={styles.serviceItem}>• {service}</Text>
      ))}
      {item.addons && item.addons.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Add-ons:</Text>
          {item.addons.map((addon, index) => (
            <Text key={`addon-${index}`} style={styles.serviceItem}>• {addon}</Text>
          ))}
        </>
      )}
      {item.notes && (
         <>
             <Text style={styles.sectionTitle}>Notes:</Text>
             <Text style={styles.notesText}>{item.notes}</Text>
         </>
      )}
      <View style={styles.totalContainer}>
         <Text style={styles.totalLabel}>Total:</Text>
         <Text style={styles.totalAmount}>${item.total}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>My Assigned Jobs</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Loading assigned jobs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.screenTitle}>My Assigned Jobs</Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading jobs: {error}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAssignedBookings}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!error && bookings.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="file-tray-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No jobs assigned to you at the moment.</Text>
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={checkBookingsForEmployee}
          >
            <Text style={styles.checkButtonText}>Check for Assignments</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  screenHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#000',
     paddingVertical: 15,
     paddingHorizontal: 15,
     paddingTop: Platform.OS === 'android' ? 40 : 15,
  },
  backButton: {
     padding: 5,
     marginRight: 15,
  },
  screenTitle: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  bookingHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 10,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  bookingStatus: {
     fontSize: 13,
     fontWeight: '500',
     color: '#fff',
     backgroundColor: '#2196F3',
     paddingHorizontal: 8,
     paddingVertical: 3,
     borderRadius: 10,
     textTransform: 'capitalize',
  },
  divider: {
     height: 1,
     backgroundColor: '#eee',
     marginVertical: 10,
  },
  detailRow: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  serviceItem: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 3,
  },
  notesText: {
     fontSize: 14,
     color: '#555',
     fontStyle: 'italic',
     marginLeft: 10,
     marginBottom: 10,
  },
  totalContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginTop: 15,
     paddingTop: 10,
     borderTopWidth: 1,
     borderTopColor: '#eee',
  },
  totalLabel: {
     fontSize: 16,
     fontWeight: '600',
     color: '#333',
  },
  totalAmount: {
     fontSize: 17,
     fontWeight: 'bold',
     color: '#000',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE', 
    padding: 12,
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  checkButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});