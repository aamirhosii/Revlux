// GiftCardScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Alert, TouchableOpacity, FlatList
} from 'react-native';
import axios from 'axios';
import { AuthContext } from './AppNavigator';

export default function GiftCardScreen() {
  const { token } = useContext(AuthContext);
  const [myGiftCards, setMyGiftCards] = useState([]);

  useEffect(() => {
    fetchMyGiftCards();
  }, []);

  const fetchMyGiftCards = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5001/giftcards/my',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyGiftCards(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load your gift cards');
    }
  };

  const handleRedeem = async (code) => {
    try {
      const res = await axios.post(
        'http://localhost:5001/giftcards/redeem',
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', `Gift card redeemed! Amount: $${res.data.amount}`);
      fetchMyGiftCards();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Unable to redeem gift card');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.codeText}>Code: {item.code}</Text>
      <Text style={styles.amountText}>Amount: ${item.amount}</Text>
      <Text style={styles.statusText}>Status: {item.isActive ? 'Active' : 'Used'}</Text>
      {item.isActive && (
        <TouchableOpacity style={styles.button} onPress={() => handleRedeem(item.code)}>
          <Text style={styles.buttonText}>Redeem Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Gift Cards</Text>
      <FlatList
        data={myGiftCards}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no gift cards.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 30 },
  card: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  codeText: {
    fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#000'
  },
  amountText: {
    fontSize: 14, color: '#333', marginBottom: 5
  },
  statusText: {
    fontSize: 14, marginBottom: 10, color: '#666'
  },
  button: {
    backgroundColor: '#000', borderRadius: 8, paddingVertical: 10, alignItems: 'center'
  },
  buttonText: {
    color: '#FFF', fontWeight: '600'
  },
});