//This is CreateAccount.js within /Shelby/src/screens:
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, Button } from 'react-native';
import axios from 'axios';
import publicIP from 'react-native-public-ip';

//const db = require('../../database');

export default function CreateAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [ipAddress, setIpAddress] = useState('');


  useEffect(() => {
    // Fetch the public IP address when the component is mounted
    publicIP()
      .then(ip => {
        setIpAddress(ip);  // Store the IP address in state
      })
      .catch(error => {
        console.log('Error fetching IP address:', error);
      });
  }, []);


  const handleCreateAccount = async () => {
    if (password !== confirmPassword) 
    {
        setErrorMessage('Passwords do not match');
    } 
    else 
    {
        setErrorMessage('');
        try 
        {
          // Get the IP address of the client
          //const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
          console.log('Client IP Address:', ipAddress);

          const response = await axios.post('http://100.70.113.161:3000/api/users/create-account', {
          //const response = await axios.post(`http://${ipAddress}:3000/api/users/create-account`, {
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
          });
          console.log(response.data);
        }
        catch(error)
        {
          if (error.response) {
            console.error('Server responded with status:', error.response.status);
            console.error('Response data:', error.response.data);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error setting up request:', error.message);
          }
          setErrorMessage('Error creating account.');
        }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.accountContainer}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Button title="Create Account" onPress={handleCreateAccount} color="black" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  accountContainer: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
