// frontend/MyBookingsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MyBookingsScreen() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => { fetchBookings() }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp  = await axios.get('http://localhost:5001/bookings', {
        headers:{ Authorization:`Bearer ${token}` }
      });
      setBookings(resp.data);
    } catch(err) {
      Alert.alert('Error', err.response?.data?.message || 'Unable to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {loading
        ? <ActivityIndicator size="large"/>
        : bookings.length===0
          ? <Text style={styles.noBookingsText}>You have no bookings.</Text>
          : bookings.map(b=>(
            <View key={b._id} style={styles.bookingItem}>
              <Text style={styles.bookingService}>Service: {b.service}</Text>
              <Text>Date: {new Date(b.appointmentDate).toLocaleDateString()}</Text>
              <Text>Time: {b.startTime} - {b.endTime}</Text>
              <Text>Status: {b.status}</Text>
              {b.status==='rejected' && b.cancellationReason && (
                <Text style={styles.rejectionReason}>Reason: {b.cancellationReason}</Text>
              )}
            </View>
          ))
      }
      <TouchableOpacity style={styles.refreshButton} onPress={fetchBookings}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:'#fff' },
  title:{ fontSize:22, fontWeight:'bold', marginBottom:20 },
  noBookingsText:{ fontSize:16, color:'#666' },
  bookingItem:{ backgroundColor:'#f9f9f9', padding:15, borderRadius:8, marginBottom:10 },
  bookingService:{ fontWeight:'600', marginBottom:5 },
  rejectionReason:{ color:'#a00', marginTop:5 },
  refreshButton:{ backgroundColor:'#000', padding:12, borderRadius:8, alignItems:'center', marginTop:15 },
  refreshButtonText:{ color:'#fff', fontWeight:'600' }
});