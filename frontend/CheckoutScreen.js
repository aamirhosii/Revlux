import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CheckoutScreen({ navigation }) {
  const route = useRoute();
  const { selectedPackage, selectedAddOns = [] } = route.params || {};


  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCheckout = () => {
    if (!name || !cardNumber || !expiry || !cvv) {
      Alert.alert('Error', 'Please fill in all payment details.');
      return;
    }
    
    Alert.alert('Success', 'Your payment has been processed.');
    navigation.navigate('Home'); // Redirect back to home after payment
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Checkout</Text>

        {/* Service Summary */}
        {selectedPackage && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>{selectedPackage.name}</Text>
            <Text style={styles.summaryPrice}>{selectedPackage.price}</Text>
            <Text style={styles.summaryDuration}>{selectedPackage.duration}</Text>
          </View>
        )}
        {selectedAddOns.length > 0 && (
          <View style={styles.addonContainer}>
            <Text style={styles.addonTitle}>Selected Add-Ons:</Text>
            {selectedAddOns.map((addon, index) => (
              <Text key={index} style={styles.addonText}>
                • {addon.replace(/_/g, ' ')} {/* Replaces underscores with spaces */}
              </Text>
            ))}
          </View>
        )}

        {/* Payment Form */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="black" 
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Card Number"
          keyboardType="numeric"
          placeholderTextColor="black" 
          value={cardNumber}
          onChangeText={setCardNumber}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholderTextColor="black" 
            placeholder="MM/YY"
            value={expiry}
            onChangeText={setExpiry}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholderTextColor="black" 
            placeholder="CVV"
            keyboardType="numeric"
            value={cvv}
            onChangeText={setCvv}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCheckout}>
          <LinearGradient colors={['#000', '#333']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Proceed to Payment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  summaryDuration: {
    fontSize: 16,
    color: '#777',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    width: '48%',
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addonContainer: {
    backgroundColor: '#EFEFEF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addonText: {
    fontSize: 16,
    color: '#333',
  },
});
