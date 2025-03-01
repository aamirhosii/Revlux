import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AppNavigator';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5001/auth/login', {
        identifier: email,  // Using 'email' as the identifier
        password,
      });
      if (response.status === 200) {
        const { token, user } = response.data;
        await signIn(token, user);
        Alert.alert('Success', `Welcome back, ${user.name}!`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>
            
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
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkButtonText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: { 
    flex: 1,
  },
  scrollViewContent: { 
    flexGrow: 1, 
    justifyContent: 'center',
  },
  formContainer: { 
    padding: 20, 
    width: '100%', 
    maxWidth: 400, 
    alignSelf: 'center',
  },
  title: {
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000000', 
    marginBottom: 20, 
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
  },
  linkButton: { 
    marginTop: 15, 
    alignItems: 'center',
  },
  linkButtonText: { 
    color: '#000000', 
    fontSize: 14, 
    textDecorationLine: 'underline',
  },
});