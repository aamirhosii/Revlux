// BookingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BookingScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch availability from the backend and filter for the selected date
  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await axios.get('http://localhost:5001/availability');
      // response.data should be an array of availability objects
      const availability = response.data.find((avail) => {
        const availDate = new Date(avail.date);
        availDate.setHours(0, 0, 0, 0);
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
        return availDate.getTime() === selected.getTime();
      });
      if (availability) {
        // Only show time slots that are still available
        setAvailableSlots(availability.timeSlots.filter((ts) => ts.isAvailable));
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Unable to fetch available slots.');
    }
    setLoadingSlots(false);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchAvailableSlots(day.dateString);
  };

  const bookSlot = async (slot) => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date first.');
      return;
    }
    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/bookings',
        {
          service: 'detailing', // Or let the user select the service
          appointmentDate: selectedDate,
          timeSlot: slot.slot, // assuming each slot object has a "slot" property
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 201) {
        Alert.alert('Success', 'Booking confirmed!');
        // Optionally refresh the available slots
        fetchAvailableSlots(selectedDate);
      }
    } catch (error) {
      console.error('Booking error:', error.response ? error.response.data : error);
      Alert.alert(
        'Booking Error',
        error.response?.data?.message || 'Error booking slot.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Book an Appointment</Text>
        <Calendar
          onDayPress={onDayPress}
          markedDates={selectedDate ? { [selectedDate]: { selected: true } } : {}}
          style={styles.calendar}
        />
        <Text style={styles.subtitle}>
          Available Time Slots on {selectedDate || 'Select a date'}
        </Text>
        {loadingSlots ? (
          <ActivityIndicator size="large" color="#000" />
        ) : availableSlots.length > 0 ? (
          availableSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={styles.slotButton}
              onPress={() => bookSlot(slot)}
            >
              <Text style={styles.slotText}>{slot.slot}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noSlotsText}>
            No available slots for the selected date.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  calendar: { marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 10 },
  slotButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  slotText: { color: '#fff', fontSize: 16 },
  noSlotsText: { fontSize: 16, color: '#888', marginTop: 10 },
});