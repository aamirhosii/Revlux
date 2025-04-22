// MyBookingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      Alert.alert('Error', err.response?.data?.message || 'Unable to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookingsText}>You have no bookings.</Text>
      ) : (
        bookings.map((booking) => {
          const dateStr = new Date(booking.appointmentDate).toLocaleDateString();
          return (
            <View key={booking._id} style={styles.bookingItem}>
              <Text style={styles.bookingService}>
                Service: {booking.service}
              </Text>
              <Text style={styles.bookingDate}>
                Date: {dateStr}
              </Text>
              <Text style={styles.bookingSlot}>
                Time: {booking.startTime} - {booking.endTime}
              </Text>
              <Text style={styles.bookingStatus}>
                Status: {booking.status}
              </Text>
            </View>
          );
        })
      )}

      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  noBookingsText: {
    fontSize: 16,
    color: '#666',
  },
  bookingItem: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookingService: {
    fontWeight: '600',
    marginBottom: 5,
  },
  bookingDate: {
    marginBottom: 3,
  },
  bookingSlot: {
    marginBottom: 3,
  },
  bookingStatus: {
    marginBottom: 3,
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});