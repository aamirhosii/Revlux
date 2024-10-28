import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Linking } from 'react-native';

export default function Contact() {
  const handlePhonePress = () => {
    Linking.openURL('tel:1234567890');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contactContainer}>
        <Text style={styles.contactTitle}>Contact Us</Text>
        <Text style={styles.contactText}>Email: info@shelbyautodetailing.com</Text>
        <Button title="Call: (416) 567-3082" onPress={handlePhonePress} color="black" />
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
  contactContainer: {
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactText: {
    fontSize: 18,
    marginBottom: 10,
  },
});