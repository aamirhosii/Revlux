import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config'; // Adjust this path as needed

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: '',
    service: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.comments ||
      !formData.service
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare data for backend
      const contactData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        message: `Service Interested: ${formData.service}\n\nComments/Vehicle Info: ${formData.comments}`
      };
      
      // Send data to backend
      const response = await axios.post(`${API_URL}/contact`, contactData);
      
      // Clear form and show success message
      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We will get back to you shortly.',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      let errorMessage = 'Failed to send your message. Please try again later.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      comments: '',
      service: '',
    });
  };

  const handlePhoneCall = () => {
    // Implementation for phone call functionality
    // You might want to add this functionality using Linking from react-native
    Alert.alert('Call', 'Calling (416) 567 - 3082');
    // Linking.openURL('tel:4165673082');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Get Your Shine On - Book Now</Text>
        <Text style={styles.description}>
          Transform your car in just a few simple steps. Call us using the call
          button or fill out the form below, and we'll get back to you shortly.
          Experience the convenience and quality of Shelby Mobile Auto Detailing
          today!
        </Text>
        <TouchableOpacity style={styles.callButton} onPress={handlePhoneCall}>
          <Text style={styles.callButtonText}>CALL (416) 567 - 3082</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>OR, Tell Us How We Can Help</Text>

        {/* Form Inputs */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name (required)</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email (required)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone (required)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vehicle Information / Comments (required)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Enter details or comments here"
            value={formData.comments}
            onChangeText={(value) => handleInputChange('comments', value)}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>What Service are you Interested in? (required)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Interior Detailing"
            value={formData.service}
            onChangeText={(value) => handleInputChange('service', value)}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  callButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  callButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  inputHalf: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 52, // To prevent layout shift when showing ActivityIndicator
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
