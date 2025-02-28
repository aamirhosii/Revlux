// ReferFriendScreen.js
import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Share
} from 'react-native';
import { AuthContext } from './AppNavigator';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReferFriendScreen() {
  const { userToken } = useContext(AuthContext);
  const [referralCode, setReferralCode] = useState('');
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      const res = await axios.get('http://localhost:5001/auth/profile', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setReferralCode(res.data.referralCode || '');
      setCredits(res.data.referralCredits || 0);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load your referral code.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Shelby Auto Detailing! Use my code: ${referralCode}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Refer a Friend</Text>
      <Text style={styles.paragraph}>
        Share your code and earn rewards when friends join or book using it!
      </Text>

      <Text style={styles.label}>Your Referral Code:</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{referralCode || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Share Code</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Referral Credits:</Text>
      <Text style={styles.creditsText}>${credits}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  paragraph: {
    fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 22
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  codeBox: {
    borderWidth: 2, borderColor: '#000', borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 10,
    marginBottom: 20
  },
  codeText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  shareButton: {
    backgroundColor: '#000', borderRadius: 8, padding: 12, marginBottom: 20
  },
  shareButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  creditsText: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 10 },
});