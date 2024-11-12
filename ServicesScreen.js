// ServicesScreen.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';

const Tab = createMaterialTopTabNavigator();

function PackagesScreen() {
  const packages = [
    {
      id: 'core',
      name: 'CORE™',
      image: require('./assets/core-car.png'), // Replace with your image path
      description: 'A basic detailing package providing essential cleaning and protection.',
      duration: '45-60 minutes',
      price: '$69',
    },
    {
      id: 'pro',
      name: 'PRO™',
      image: require('./assets/pro-car.png'), // Replace with your image path
      description: 'A comprehensive detailing package with added services.',
      duration: '90-120 minutes',
      price: '$109',
    },
    {
      id: 'ultra',
      name: 'ULTRA™',
      image: require('./assets/ultra-car.png'), // Replace with your image path
      description: 'The ultimate detailing package for complete care.',
      duration: '120-150 minutes',
      price: '$199',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Text style={styles.header}>MOBILE DETAILING PACKAGES</Text>
      <Text style={styles.subHeader}>Luxury Car Care Delivered to Your Home</Text>

      {packages.map((pkg) => (
        <View key={pkg.id} style={styles.packageContainer}>
          <Text style={styles.packageTitle}>{pkg.name}</Text>
          <Image source={pkg.image} style={styles.packageImage} resizeMode="contain" />
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Service Description</Text>
            <Text style={styles.detailValue}>{pkg.description}</Text>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{pkg.duration}</Text>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>{pkg.price}</Text>
          </View>
          <TouchableOpacity style={styles.bookNowButton}>
            <Text style={styles.bookNowText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

function OptionsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.optionContainer}>
        <Text style={styles.optionTitle}>Interior Detailing</Text>
        <Text style={styles.optionDescription}>A thorough cleaning of the interior, including seats, carpets, and dashboard.</Text>
      </View>
      <View style={styles.optionContainer}>
        <Text style={styles.optionTitle}>Exterior Detailing</Text>
        <Text style={styles.optionDescription}>Comprehensive cleaning, polishing, and protection for the exterior surfaces.</Text>
      </View>
      <View style={styles.optionContainer}>
        <Text style={styles.optionTitle}>Ceramic Coating</Text>
        <Text style={styles.optionDescription}>Protects your vehicle's paint with a durable ceramic coating.</Text>
      </View>
    </ScrollView>
  );
}

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#1a1a1a',
          tabBarIndicatorStyle: { backgroundColor: '#F5C518' },
          tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
          tabBarStyle: { backgroundColor: '#FFF' },
        }}
      >
        <Tab.Screen name="Packages" component={PackagesScreen} />
        <Tab.Screen name="Options" component={OptionsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  packageContainer: {
    width: '90%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  packageImage: {
    width: '100%',
    height: 150,
    marginBottom: 15,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bookNowButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
  },
  bookNowText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionContainer: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
