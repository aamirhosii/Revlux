//This is Account.js within /Shelby/src/screens:
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, Button } from 'react-native';

export default function Account({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State to manage the message
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


  const handleSignIn = async () => {
    // Handle sign-in logic here
    console.log('Sign In:', email, password);
    try {
      const response = await axios.post(`http://${ipAddress}:3000/api/users/create-account`, { email, password });
      
      // If successful, display a success message
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        // If the server responded with a status other than 2xx
        setMessage(error.response.data.message);
      } else {
        // Network or other errors
        setMessage('Error logging in. Please try again.');
      }
    }
  };

  const handleCreateAccount = () => {
    // Handle create account logic here
    console.log('Create Account:', email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.accountContainer}>
        <Text style={styles.title}>Account</Text>

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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button title="Sign In" onPress={handleSignIn} color="black" />
          <Button title="Create Account" onPress={() => navigation.navigate('CreateAccount')} color="black" />
        </View>

        {/* Display the message based on the sign-in result */}
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountContainer: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  messageText: {
    marginTop: 20,
    color: 'green',
    fontWeight: 'bold',
  },
});
