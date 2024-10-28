import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function BookingScreen() {
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
          {/* Add more content here as needed */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
});