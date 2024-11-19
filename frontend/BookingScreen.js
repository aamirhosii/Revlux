import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

const postalCodeData = {
  cities: {
    Toronto: {
      postal_code_prefixes: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9'],
    },
    Vaughan: {
      postal_code_prefixes: ['L4H', 'L4J', 'L4K', 'L6A'],
    },
    'Richmond Hill': {
      postal_code_prefixes: ['L4B', 'L4C', 'L4E', 'L4S'],
    },
    Etobicoke: {
      postal_code_prefixes: ['M8V', 'M8W', 'M8X', 'M8Y', 'M8Z', 'M9A', 'M9B', 'M9C'],
    },
    Oakville: {
      postal_code_prefixes: ['L6H', 'L6J', 'L6K', 'L6L', 'L6M'],
    },
    Maple: {
      postal_code_prefixes: ['L6A'],
    },
    Markham: {
      postal_code_prefixes: ['L3P', 'L3R', 'L3S', 'L6B', 'L6C', 'L6E'],
    },
    Scarborough: {
      postal_code_prefixes: [
        'M1B', 'M1C', 'M1E', 'M1G', 'M1H', 'M1J', 'M1K', 'M1L', 'M1M',
        'M1N', 'M1P', 'M1R', 'M1S', 'M1T', 'M1V', 'M1W', 'M1X',
      ],
    },
    Newmarket: {
      postal_code_prefixes: ['L3X', 'L3Y'],
    },
    Mississauga: {
      postal_code_prefixes: [
        'L4T', 'L4W', 'L4X', 'L4Y', 'L5A', 'L5B', 'L5C', 'L5E', 'L5G',
        'L5H', 'L5J', 'L5K', 'L5L', 'L5M', 'L5N', 'L5P', 'L5R', 'L5S', 'L5T',
      ],
    },
  },
};

export default function BookingScreen() {
  const [postalCode, setPostalCode] = useState('');

  const checkServiceAvailability = () => {
    const cityNames = Object.keys(postalCodeData.cities);
    const isAvailable = cityNames.some((city) => {
      const prefixes = postalCodeData.cities[city].postal_code_prefixes;
      return prefixes.some((prefix) => postalCode.startsWith(prefix));
    });

    if (isAvailable) {
      Alert.alert('Service Available', 'We provide services in your area.');
    } else {
      Alert.alert('Service Unavailable', 'Sorry, we do not provide services in your area.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Mobile Detailing Services</Text>
          <Text style={styles.description}>
            Experience the convenience of our professional mobile detailing services.
            We bring our expertise directly to your location, ensuring your vehicle
            receives top-notch care without you having to leave your home or office.
          </Text>
          <Text style={styles.subtitle}>Check Service Availability</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your postal code"
            placeholderTextColor="#555"
            value={postalCode}
            onChangeText={setPostalCode}
          />
          <TouchableOpacity style={styles.button} onPress={checkServiceAvailability}>
            <Text style={styles.buttonText}>Check Availability</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000', // Black text for title
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333333', // Darker grey for description
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'justify',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000', // Black subtitle
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f8f8f8', // Light grey for input field
    color: '#000000', // Black input text
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd', // Border for input
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000000', // Black button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff', // White text on button
    fontSize: 16,
    fontWeight: '600',
  },
});
