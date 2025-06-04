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

  const fetchAssignedBookings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/employee/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching assigned bookings:", error.response?.data?.message || error.message);
      Alert.alert("Error", "Failed to load assigned jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAssignedBookings();
  }, [fetchAssignedBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignedBookings();
  }, [fetchAssignedBookings]);

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
         <Text style={styles.customerName}>{item.customerName}</Text>
         <Text style={styles.bookingStatus}>{item.status}</Text>
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
         <Text style={styles.detailText}>Customer: {item.user?.name || 'N/A'} ({item.phone})</Text>
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
      {/* Add more details or actions for employees if needed */}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading assigned jobs...</Text>
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
      {bookings.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="file-tray-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No jobs assigned to you at the moment.</Text>
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
     paddingTop: Platform.OS === 'android' ? 40 : 15, // Adjust for StatusBar
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
     backgroundColor: '#2196F3', // Example color, adjust based on status
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
  },
});