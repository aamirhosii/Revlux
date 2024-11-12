import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

function PackagesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Gold Wash</Text>
        <Text style={styles.serviceDescription}>55 to 70 minutes • Starts at $69</Text>
      </View>
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Platinum Wash</Text>
        <Text style={styles.serviceDescription}>90 to 120 minutes • Starts at $109</Text>
      </View>
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Deluxe Detail</Text>
        <Text style={styles.serviceDescription}>150 to 180 minutes • Starts at $199</Text>
      </View>
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Ultimate Detail</Text>
        <Text style={styles.serviceDescription}>200 to 240 minutes • Starts at $299</Text>
      </View>
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
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  serviceContainer: {
    backgroundColor: '#333',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  serviceDescription: {
    fontSize: 16,
    color: '#CCC',
    marginTop: 5,
  },
  optionContainer: {
    backgroundColor: '#444',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  optionDescription: {
    fontSize: 16,
    color: '#CCC',
    marginTop: 5,
  },
});
