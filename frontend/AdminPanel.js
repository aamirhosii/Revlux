// AdminPanel.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Minimum durations (in minutes) for each service
const SERVICE_DURATIONS = {
  CORE: 90,
  PRO: 120,
  ULTRA: 180,
  SAPPHIRE: 360,
  EMERALD: 440,
  DIAMOND: 550,
};

// Helper: parse "HH:MM" into total minutes from midnight
function parseTimeToMinutes(timeStr) {
  // e.g. "10:00" -> [10, 0] -> 600
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh * 60 + mm;
}

// Helper: convert total minutes back to "HH:MM"
function formatMinutesToTime(minutes) {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  // zero-pad the hours and minutes
  const hhStr = String(hh).padStart(2, '0');
  const mmStr = String(mm).padStart(2, '0');
  return `${hhStr}:${mmStr}`;
}

// Our 6 service types
const SERVICE_TYPES = ['CORE', 'PRO', 'ULTRA', 'SAPPHIRE', 'EMERALD', 'DIAMOND'];

export default function AdminPanel() {
  const [date, setDate] = useState('');
  const [allSlots, setAllSlots] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [selectedService, setSelectedService] = useState('CORE');

  const [allAvailability, setAllAvailability] = useState([]);

  useEffect(() => {
    fetchAllAvailability();
  }, []);

  const fetchAllAvailability = async () => {
    try {
      const response = await axios.get('http://localhost:5001/availability');
      setAllAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability', error);
      Alert.alert('Error', 'Failed to fetch availability');
    }
  };

  // This function auto-calculates the endTime based on startTime + serviceDuration
  const addTimeSlotToList = () => {
    if (!startTime) {
      Alert.alert('Missing fields', 'Please provide start time.');
      return;
    }
    // Parse the selected service's required duration in minutes
    const requiredMinutes = SERVICE_DURATIONS[selectedService] || 90;

    // Convert "HH:MM" to total minutes
    const startMins = parseTimeToMinutes(startTime);

    // Calculate the end time by adding the required duration
    const endMins = startMins + requiredMinutes;
    if (endMins > 24 * 60) {
      Alert.alert('Invalid Slot', 'This time slot extends past midnight. Please choose another.');
      return;
    }

    const computedEndTime = formatMinutesToTime(endMins);

    // Create a new slot
    const newSlot = {
      startTime,
      endTime: computedEndTime,
      serviceType: selectedService,
      isAvailable: true
    };

    setAllSlots(prev => [...prev, newSlot]);
    // Reset the start time
    setStartTime('');
  };

  // Submit the entire set of time slots for a date
  const handleCreateAvailability = async () => {
    if (!date || allSlots.length === 0) {
      Alert.alert('Missing fields', 'Please provide a date and at least one time slot.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      // POST to backend: date, timeSlots
      await axios.post(
        'http://localhost:5001/availability',
        { date, timeSlots: allSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Availability updated!');
      // reset local state
      setDate('');
      setAllSlots([]);
      setStartTime('');
      setSelectedService('CORE');
      fetchAllAvailability();
    } catch (error) {
      console.error('Error creating availability', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create availability');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Admin Panel</Text>
        <Text style={styles.screenSubtitle}>Manage availability, bookings, and more</Text>

        {/* CREATE AVAILABILITY SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Create / Update Availability</Text>
          </View>

          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2025-03-01"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Select Service Type</Text>
          <View style={styles.pickerContainer}>
            {SERVICE_TYPES.map((serv) => (
              <TouchableOpacity
                key={serv}
                style={[
                  styles.serviceTypeButton, 
                  selectedService === serv && styles.serviceTypeButtonActive
                ]}
                onPress={() => setSelectedService(serv)}
              >
                <Text 
                  style={[
                    styles.serviceTypeButtonText,
                    selectedService === serv && styles.serviceTypeButtonTextActive
                  ]}
                >
                  {serv}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            Start Time (HH:MM) — e.g. "10:00"
          </Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="10:00"
            placeholderTextColor="#888"
          />

          {/* The endTime is auto-calculated. If you want the admin to see it, 
              you could show it in a read-only field, or handle 
              additional seats, etc. */}

          <TouchableOpacity style={styles.addSlotButton} onPress={addTimeSlotToList}>
            <Ionicons name="add-outline" size={24} color="#fff" />
            <Text style={styles.addSlotButtonText}>Add Slot</Text>
          </TouchableOpacity>

          {/* Display the new slots to be added */}
          {allSlots.length > 0 && (
            <View style={styles.timeSlotsContainer}>
              <Text style={[styles.label, { marginBottom: 5 }]}>Time Slots to add:</Text>
              {allSlots.map((slot, idx) => (
                <Text key={idx} style={styles.slotItem}>
                  • {slot.serviceType} {slot.startTime} - {slot.endTime}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateAvailability}>
            <Text style={styles.primaryButtonText}>Save Availability</Text>
          </TouchableOpacity>
        </View>

        {/* EXISTING AVAILABILITY */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={24} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Existing Availability</Text>
          </View>

          {allAvailability.map((avail) => {
            const dateStr = new Date(avail.date).toISOString().split('T')[0];
            return (
              <View key={avail._id} style={styles.availabilityItem}>
                <Text style={styles.availabilityDate}>{dateStr}</Text>
                {avail.timeSlots.map((ts, index) => (
                  <Text key={index} style={styles.timeSlotText}>
                    {ts.serviceType}: {ts.startTime} - {ts.endTime} —{' '}
                    <Text style={{ color: ts.isAvailable ? 'green' : 'red' }}>
                      {ts.isAvailable ? 'Available' : 'Booked'}
                    </Text>
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  serviceTypeButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  serviceTypeButtonActive: {
    backgroundColor: '#000',
  },
  serviceTypeButtonText: {
    color: '#000',
  },
  serviceTypeButtonTextActive: {
    color: '#fff',
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  addSlotButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  slotItem: {
    color: '#333',
    marginBottom: 2,
  },
  primaryButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  availabilityItem: {
    backgroundColor: '#fafafa',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  availabilityDate: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
    color: '#000',
  },
  timeSlotText: {
    color: '#333',
  },
});