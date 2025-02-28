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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);

  // Generate a 6-digit OTP for demonstration
  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    console.log('Generated OTP:', newOtp);
    return newOtp;
  };

  // Check uniqueness (only email in this example)
  const checkUniqueness = async () => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      console.log('Checking uniqueness with =>', { email: normalizedEmail });

      // POST /check-uniqueness on your backend
      const response = await axios.post('http://localhost:5001/auth/check-uniqueness', {
        email: normalizedEmail,
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

    // Simulate sending an OTP (to email)
    const newOtp = generateOtp();
    console.log(`OTP sent to ${email}: ${newOtp}`);
    setStep(2);
  };

  const handleOtpSubmit = async () => {
    if (otp !== generatedOtp) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
      return;
    }

    try {
      const data = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password,
      };

      // 1) Sign up
      const signupResponse = await axios.post('http://localhost:5001/auth/signup', data);
      if (signupResponse.status === 201) {
        // 2) Immediately log in
        const loginResponse = await axios.post('http://localhost:5001/auth/login', {
          identifier: email.trim().toLowerCase(),  // Since we use email as the identifier
          password,
        });

        if (loginResponse.status === 200) {
          const { token, user } = loginResponse.data;
          await signIn(token, user);
          Alert.alert('Success', `Welcome, ${user.name}!`);
          navigation.navigate('Main');
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

          <TouchableOpacity style={styles.button} onPress={handleInitialSubmit}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Enter the OTP sent to your Email"
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
  button: {
    backgroundColor: '#000000',
    padding: 12,
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