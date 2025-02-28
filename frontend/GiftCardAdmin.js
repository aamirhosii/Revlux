// GiftCardAdmin.js (admin can create gift cards for any user)
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AppNavigator';

export default function GiftCardAdmin() {
  const { userToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      // Suppose we have an admin route: GET /auth/allUsers
      const res = await axios.get('http://localhost:5001/auth/allUsers', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Unable to fetch users');
    }
  };

  const handleCreateGiftCard = async () => {
    if (!selectedUserId || !amount) {
      Alert.alert('Error', 'Please select a user and enter an amount');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5001/giftcards/create',
        { userId: selectedUserId, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      Alert.alert('Success', 'Gift card created!');
      setSelectedUserId('');
      setAmount('');
    } catch (err) {
      console.error('Gift card creation error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to create gift card');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Gift Card Admin</Text>
        <Text style={styles.subtitle}>Issue Gift Cards to Users</Text>

        <Text style={styles.label}>Select a User</Text>
        {/* For simplicity, a text list. 
            In production, you'd do a nice dropdown. */}
        {users.map((u) => (
          <TouchableOpacity
            key={u._id}
            style={[
              styles.userItem,
              selectedUserId === u._id && styles.userItemSelected
            ]}
            onPress={() => setSelectedUserId(u._id)}
          >
            <Text style={styles.userText}>{u.name} ({u.email})</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="$100"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateGiftCard}>
          <Text style={styles.buttonText}>Create Gift Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FFF'
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 26, fontWeight: 'bold', marginBottom: 10
  },
  subtitle: {
    fontSize: 16, marginBottom: 20, color: '#555'
  },
  label: {
    fontSize: 16, fontWeight: '600', marginBottom: 8
  },
  userItem: {
    borderWidth: 1, borderColor: '#CCC',
    borderRadius: 6, padding: 10,
    marginBottom: 10
  },
  userItemSelected: {
    backgroundColor: '#000'
  },
  userText: {
    color: '#000'
  },
  input: {
    borderWidth: 1, borderColor: '#CCC',
    borderRadius: 6, padding: 10,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 6,
    padding: 15,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF', fontWeight: '600'
  },
});