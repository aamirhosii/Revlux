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
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Configure Notifications to show in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Service types
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

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Request permissions for notifications (local only here)
  const requestNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted!');
    }
  };

  // Show local notification once booked
  const showBookingNotification = async (service, date, startTime, endTime) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Confirmed',
        body: `${service} booked on ${date} from ${startTime} to ${endTime}.`,
      },
      trigger: null, // immediate
    });
  };

  // Fetch available slots for chosen date & service
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
        fetchAvailableSlots(selectedDate);

        // Show local push notification
        showBookingNotification(selectedService, selectedDate, slot.startTime, slot.endTime);
      }
    } catch (error) {
      console.error('Booking error:', error.response ? error.response.data : error);
      Alert.alert('Booking Error', error.response?.data?.message || 'Error booking slot.');
    }
  };

  const onSelectService = (serviceValue) => {
    setSelectedService(serviceValue);
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
          {/* Subtle Gradient Overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.6)']}
            style={styles.gradientOverlay}
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Book an Appointment</Text>
            <Text style={styles.heroSubtitle}>Select a service and date below</Text>
          </View>
        </ImageBackground>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SERVICE SELECTION */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Choose a Service</Text>
          <View style={styles.serviceButtonRow}>
            {SERVICE_TYPES.map((item) => {
              const isActive = item.value === selectedService;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.serviceButton, isActive && styles.serviceButtonActive]}
                  onPress={() => onSelectService(item.value)}
                >
                  <Text style={[styles.serviceButtonText, isActive && styles.serviceButtonTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CALENDAR */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Pick a Date</Text>
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
          <Text style={styles.cardHeading}>
            Available Time Slots {selectedDate ? `on ${selectedDate}` : ''}
          </Text>

          {loadingSlots ? (
            <ActivityIndicator size="large" color="#000" style={{ marginVertical: 12 }} />
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
                : 'Select a date to see available slots.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#eee',
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    // Android elevation
    elevation: 3,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },

  // Service Buttons
  serviceButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  serviceButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  serviceButtonTextActive: {
    color: '#fff',
  },

  // Calendar
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  // Slots
  slotButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    marginVertical: 6,
    alignItems: 'center',
  },
  slotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 8,
  },
});