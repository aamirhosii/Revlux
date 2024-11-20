// ProfileScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from './AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { signOut } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    carInfo: '',
    homeAddress: '',
  });

  useEffect(() => {
    // Fetch user data from backend
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5001/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          signOut();
        } else {
          Alert.alert('Error', 'Failed to load profile data.');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.put(
        'http://localhost:5001/auth/profile',
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(response.data);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF5C5C" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#888888" style={styles.icon} />
            <TextInput
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#888888" style={styles.icon} />
            <TextInput
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email Address"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={20} color="#888888" style={styles.icon} />
            <TextInput
              value={userData.phoneNumber}
              onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="car-outline" size={20} color="#888888" style={styles.icon} />
            <TextInput
              value={userData.carInfo}
              onChangeText={(text) => setUserData({ ...userData, carInfo: text })}
              style={styles.input}
              placeholder="Car Information"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="home-outline" size={20} color="#888888" style={styles.icon} />
            <TextInput
              value={userData.homeAddress}
              onChangeText={(text) => setUserData({ ...userData, homeAddress: text })}
              style={styles.input}
              placeholder="Home Address"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 5,
    color: '#FF5C5C',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
