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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);

  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);

  // Check uniqueness (only email in this example)
  const checkUniqueness = async () => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // POST /check-uniqueness on your backend
      const response = await axios.post(`${API_URL}/auth/check-uniqueness`, {
        email: normalizedEmail,
      });

      if (response.status === 200) {
        return true;
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error checking uniqueness');
      return false;
    }
  };

  const handleInitialSubmit = async () => {
    // Basic validations
    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    // Check email uniqueness
    const isUnique = await checkUniqueness();
    if (!isUnique) return;

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password,
      };

      // Call the signup API which will generate and send OTP via email
      const signupResponse = await axios.post(`${API_URL}/auth/signup`, data);
      
      if (signupResponse.status === 201) {
        // Server has generated and sent the OTP to user's email
        setUserId(signupResponse.data.userId);
        Alert.alert(
          'Verification Required', 
          'A verification code has been sent to your email. Please check your inbox and spam folder.\n\nIf you don\'t see it within a few minutes, check your spam folder or request a new code.',
          [{ text: 'OK' }]
        );
        setStep(2);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong with registration');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      // Verify the OTP with the backend
      const verifyResponse = await axios.post(`${API_URL}/auth/verify-signup`, {
        email: email.trim().toLowerCase(),
        otp: otp
      });

      if (verifyResponse.status === 200) {
        // OTP verified, user is now verified
        const { token, user } = verifyResponse.data;
        
        // Sign in the user
        await signIn(token, user);
        Alert.alert('Success', `Welcome, ${user.name}! Your account has been verified.`);
        navigation.navigate('Main');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email: email.trim().toLowerCase()
      });

      if (response.status === 200) {
        Alert.alert('Success', 'A new verification code has been sent to your email. Please check your inbox and spam folder.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
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
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(val) => setEmail(val.trim())}
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

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleInitialSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.verificationText}>
            Enter the verification code sent to{'\n'}{email}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Verification Code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleOtpSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify & Create Account</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resendLink} 
            onPress={handleResendOtp}
            disabled={loading}
          >
            <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
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
  button: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
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
  verificationText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  resendLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  resendText: {
    color: '#000000',
    textDecorationLine: 'underline',
  }
});