// BookingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1) Import the expo-notifications library
import * as Notifications from 'expo-notifications';

// 2) Set notification handler so that notifications
// will show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 6 Services (labels + internal values)
const SERVICE_TYPES = [
  { label: 'CORE™ (90 Min)', value: 'CORE' },
  { label: 'PRO™ (120 Min)', value: 'PRO' },
  { label: 'ULTRA™ (180 Min)', value: 'ULTRA' },
  { label: 'SAPPHIRE™ (~4h)', value: 'SAPPHIRE' },
  { label: 'EMERALD™ (~6h)', value: 'EMERALD' },
  { label: 'DIAMOND™ (~8h)', value: 'DIAMOND' },
];

const { width: screenWidth } = Dimensions.get('window');

export default function BookingScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState('CORE');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 3) Request permission for push notifications on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  /**
   * Request and check push notification permission.
   * For local notifications, if user denies, they'll just never see them.
   */
  const requestNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // if not granted, prompt user
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If still not granted, you could alert or handle accordingly
    if (finalStatus !== 'granted') {
      console.log('Notifications permission not granted!');
    }
  };

  /**
   * Helper to show a local push notification after successful booking
   */
  const showBookingNotification = async (service, date, startTime, endTime) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Confirmed!',
        body: `${service} booked on ${date} from ${startTime} to ${endTime}.`,
        data: { service, date, startTime, endTime },
      },
      trigger: null, // Fire instantly (no delay)
    });
  };

  // Fetch available slots from server for the chosen date & service
  const fetchAvailableSlots = async (dateString) => {
    setLoadingSlots(true);
    try {
      const response = await axios.get('http://localhost:5001/availability');

      const dateOnly = new Date(dateString);
      dateOnly.setHours(0, 0, 0, 0);

      const found = response.data.find((avail) => {
        let d = new Date(avail.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === dateOnly.getTime();
      });

      if (!found) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      // Filter slots for (service === selectedService) and isAvailable
      const filteredSlots = found.timeSlots.filter(
        (ts) => ts.serviceType === selectedService && ts.isAvailable
      );
      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Unable to fetch available slots.');
    }
    setLoadingSlots(false);
  };

  // Called when user taps a date on the Calendar
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchAvailableSlots(day.dateString);
  };

  // Called when user taps a time slot
  const bookSlot = async (slot) => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date first.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/bookings',
        {
          service: selectedService,
          appointmentDate: selectedDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        Alert.alert('Success', 'Booking confirmed!');
        // Refresh the slots
        fetchAvailableSlots(selectedDate);

        // 4) Show local push notification
        showBookingNotification(
          selectedService,
          selectedDate,
          slot.startTime,
          slot.endTime
        );
      }
    } catch (error) {
      console.error('Booking error:', error.response ? error.response.data : error);
      Alert.alert('Booking Error', error.response?.data?.message || 'Error booking slot.');
    }
  };

  // Called when user taps a service button
  const onSelectService = (serviceValue) => {
    setSelectedService(serviceValue);
    // If a date is already selected, refetch the slots
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero / Header Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{ uri: 'https://via.placeholder.com/1200x400?text=Shelby+Auto+Detailing' }}
          style={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Book an Appointment</Text>
            <Text style={styles.heroSubtitle}>Select a service and date below</Text>
          </View>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* SERVICE SELECTION (BUTTONS) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Choose a Service</Text>
          <View style={styles.serviceButtonRow}>
            {SERVICE_TYPES.map((item) => {
              const isActive = (item.value === selectedService);
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.serviceButton, isActive && styles.serviceButtonActive]}
                  onPress={() => onSelectService(item.value)}
                >
                  <Text
                    style={[styles.serviceButtonText, isActive && styles.serviceButtonTextActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CALENDAR PICKER */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pick a Date</Text>
          <Calendar
            onDayPress={onDayPress}
            markedDates={selectedDate ? { [selectedDate]: { selected: true } } : {}}
            style={styles.calendar}
            theme={{
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              arrowColor: '#000',
            }}
          />
        </View>

        {/* TIME SLOTS */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Available Time Slots {selectedDate ? `on ${selectedDate}` : ''}
          </Text>

          {loadingSlots ? (
            <ActivityIndicator size="large" color="#000" style={{ marginVertical: 10 }} />
          ) : availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.slotButton} 
                onPress={() => bookSlot(slot)}
              >
                <Text style={styles.slotText}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSlotsText}>
              {selectedDate 
                ? 'No available slots for this date/service.'
                : 'Select a date to see available slots.'
              }
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0', 
  },
  heroContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#DDD',
    overflow: 'hidden',
    marginBottom: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  heroTitle: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 3,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },

  // Service Buttons
  serviceButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  serviceButtonActive: {
    backgroundColor: '#000',
  },
  serviceButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  serviceButtonTextActive: {
    color: '#FFF',
  },

  calendar: {
    borderRadius: 10,
  },
  slotButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  slotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  noSlotsText: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
});