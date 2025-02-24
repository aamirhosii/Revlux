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

export default function AdminPanel() {
  // Availability states
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [allAvailability, setAllAvailability] = useState([]);

  // (Optional) If you want to add booking management here, you can add state for bookings
  // and functions to fetch/update them.
  // For now, this panel handles creating and viewing availability.

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

  const addTimeSlotToList = () => {
    if (!newSlot) return;
    setTimeSlots((prev) => [...prev, { slot: newSlot, isAvailable: true }]);
    setNewSlot('');
  };

  const handleCreateAvailability = async () => {
    if (!date || timeSlots.length === 0) {
      Alert.alert('Missing fields', 'Please provide a date and at least one time slot.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/availability',
        { date, timeSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Availability added!');
      setDate('');
      setTimeSlots([]);
      setNewSlot('');
      fetchAllAvailability();
    } catch (error) {
      console.error('Error creating availability', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create availability');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Admin Panel</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2025-03-01"
          />
          <Text style={styles.label}>Add a Time Slot</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 5 }]}
              value={newSlot}
              onChangeText={setNewSlot}
              placeholder="e.g. 10:00 AM - 11:00 AM"
            />
            <TouchableOpacity style={styles.addSlotButton} onPress={addTimeSlotToList}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Time Slots to be Added:</Text>
          {timeSlots.map((slot, idx) => (
            <Text key={idx} style={{ marginLeft: 10 }}>{slot.slot}</Text>
          ))}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateAvailability}>
            <Text style={styles.buttonText}>Create Availability</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.header, { marginTop: 20 }]}>Existing Availability</Text>
        {allAvailability.map((avail) => {
          const dateStr = new Date(avail.date).toISOString().split('T')[0];
          return (
            <View key={avail._id} style={styles.availabilityItem}>
              <Text style={styles.availabilityDate}>{dateStr}</Text>
              {avail.timeSlots.map((ts, index) => (
                <Text key={index}>{ts.slot} — {ts.isAvailable ? 'Available' : 'Booked'}</Text>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  form: { marginBottom: 30 },
  label: { fontWeight: '600', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 10, marginBottom: 10, color: '#000' },
  addSlotButton: { backgroundColor: 'black', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 15 },
  createButton: { backgroundColor: 'black', borderRadius: 8, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  availabilityItem: { backgroundColor: '#F0F0F0', padding: 10, marginBottom: 10, borderRadius: 8 },
  availabilityDate: { fontWeight: 'bold', marginBottom: 5 },
});