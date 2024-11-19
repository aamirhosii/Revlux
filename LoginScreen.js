import React, { useState } from 'react';
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
  Switch,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [usePhoneNumber, setUsePhoneNumber] = useState(false);
  const navigation = useNavigation();

  const handleLogin = () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!usePhoneNumber && !/\S+@\S+\.\S+/.test(identifier)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (usePhoneNumber && !/^\+?[1-9]\d{1,14}$/.test(identifier)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Here you would typically call your authentication API
    console.log('Login attempt with:', { identifier, password });
    navigation.navigate('Main', {
      screen: 'MainStack',
      params: {
        screen: 'Home',
      },
    });
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
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Use Phone Number</Text>
              <Switch
                value={usePhoneNumber}
                onValueChange={setUsePhoneNumber}
                trackColor={{ false: "#767577", true: "#000000" }}
                thumbColor={usePhoneNumber ? "#ffffff" : "#f4f3f4"}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder={usePhoneNumber ? "Phone Number" : "Email"}
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType={usePhoneNumber ? "phone-pad" : "email-address"}
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
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Signup')}
            >
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000000',
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