import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: '',
    service: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.comments ||
      !formData.service
    ) {
      alert('Please fill in all required fields.');
    } else {
      alert('Your message has been submitted. We will get back to you shortly!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        comments: '',
        service: '',
      });
    }
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
        <TouchableOpacity style={styles.callButton}>
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
