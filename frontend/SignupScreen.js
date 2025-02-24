// SignupScreen.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AppNavigator';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Simple OTP flow for demonstration
  const [otp, setOtp] = useState('');
  const [usePhoneNumber, setUsePhoneNumber] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);

  // For demonstration only: generate a 6-digit OTP
  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    console.log('Generated OTP:', newOtp);
    return newOtp;
  };

  // Check uniqueness (only email or phone)
  const checkUniqueness = async () => {
    try {
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      const normalizedPhone = phoneNumber ? phoneNumber.trim() : null;

      console.log('Checking uniqueness with =>', {
        email: usePhoneNumber ? null : email.trim().toLowerCase(),
        phoneNumber: usePhoneNumber ? phoneNumber.trim() : null,
      });

      // If you're on Android emulator, you may need http://10.0.2.2:5001
      const response = await axios.post('http://localhost:5001/auth/check-uniqueness', {
        email: usePhoneNumber ? null : normalizedEmail,
        phoneNumber: usePhoneNumber ? normalizedPhone : null,
      });

      if (response.status === 200) {
        return true;
      }
    } catch (err) {
      console.error('Uniqueness Check Error:', err.response?.data?.message || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Error checking uniqueness');
      return false;
    }
  };

  const handleInitialSubmit = async () => {
    if (!name || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    if (!email && !phoneNumber) {
      Alert.alert('Error', 'Please provide either an email or phone number');
      return;
    }

    // Only check email/phone for uniqueness
    const isUnique = await checkUniqueness();
    if (!isUnique) return;

    // "Send" OTP
    const newOtp = generateOtp();
    console.log(`OTP sent to ${usePhoneNumber ? phoneNumber : email}: ${newOtp}`);
    setStep(2);
  };

  const handleOtpSubmit = async () => {
    if (otp !== generatedOtp) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
      return;
    }

    try {
      const normalizedName = name.trim();
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      const normalizedPhone = phoneNumber ? phoneNumber.trim() : null;

      const data = {
        name: normalizedName,
        email: usePhoneNumber ? null : normalizedEmail,
        phoneNumber: usePhoneNumber ? normalizedPhone : null,
        password,
      };

      // Signup
      const signupResponse = await axios.post('http://localhost:5001/auth/signup', data);
      if (signupResponse.status === 201) {
        // Immediately log them in
        const loginResponse = await axios.post('http://localhost:5001/auth/login', {
          identifier: usePhoneNumber ? phoneNumber : email,
          password,
        });

        if (loginResponse.status === 200) {
          const { token, user } = loginResponse.data;
          // MUST pass both token and user
          await signIn(token, user);

          Alert.alert('Success', `Welcome, ${user.name}!`);
          navigation.navigate('Main'); // or wherever you want to redirect
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      {step === 1 ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Use Phone Number</Text>
            <Switch value={usePhoneNumber} onValueChange={setUsePhoneNumber} />
          </View>
          {usePhoneNumber ? (
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
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
          <TouchableOpacity style={styles.button} onPress={handleInitialSubmit}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleOtpSubmit}>
            <Text style={styles.buttonText}>Verify & Create Account</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#000000',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});