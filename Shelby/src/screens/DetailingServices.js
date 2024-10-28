import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, TouchableOpacity } from 'react-native';

export default function DetailingServices() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Detailing Services</Text>

      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>CORE</Text>
        <Button title="Book now" color="black" onPress={() => {}} />
        <TouchableOpacity onPress={() => toggleDropdown('coreDescription')}>
          <Text style={styles.dropdownTitle}>Service Description</Text>
        </TouchableOpacity>
        {openDropdown === 'coreDescription' && (
          <Text style={styles.dropdownContent}>
            Comprehensive Vacuum Cleaning{'\n'}
            Dashboard Dusting & Wipe Down{'\n'}
            Door Panel Cleaning{'\n'}
            Window & Mirror Cleaning{'\n'}
            Floor Mat Cleaning
          </Text>
        )}
        <TouchableOpacity onPress={() => toggleDropdown('coreDuration')}>
          <Text style={styles.dropdownTitle}>Duration</Text>
        </TouchableOpacity>
        {openDropdown === 'coreDuration' && (
          <Text style={styles.dropdownContent}>
            90 Minutes*{'\n'}
            Additional 25 Minutes for 3-Row Vehicles
          </Text>
        )}
      </View>

      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>PRO</Text>
        <Button title="Book now" color="black" onPress={() => {}} />
        <TouchableOpacity onPress={() => toggleDropdown('proDescription')}>
          <Text style={styles.dropdownTitle}>Service Description</Text>
        </TouchableOpacity>
        {openDropdown === 'proDescription' && (
          <Text style={styles.dropdownContent}>
          Everything in CORE™ Plus{'\n'}
          Interior Deep Steam Cleaning{'\n'}
          Carpet & Floor Mat Shampoo{'\n'}
          Leather Cleaning & Conditioning
          </Text>
        )}
        <TouchableOpacity onPress={() => toggleDropdown('proDuration')}>
          <Text style={styles.dropdownTitle}>Duration</Text>
        </TouchableOpacity>
        {openDropdown === 'proDuration' && (
          <Text style={styles.dropdownContent}>
            120 Minutes*{'\n'}
            Additional 30 Minutes for 3-Row Vehicles
          </Text>
        )}
      </View>

      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>ULTRA</Text>
        <Button title="Book now" color="black" onPress={() => {}} />
        <TouchableOpacity onPress={() => toggleDropdown('ultraDescription')}>
          <Text style={styles.dropdownTitle}>Service Description</Text>
        </TouchableOpacity>
        {openDropdown === 'ultraDescription' && (
          <Text style={styles.dropdownContent}>
            Everything in PRO™ Plus{'\n'}
            Interior Ceramic Coating{'\n'}
            Extractor Vacuum Deep Cleaning{'\n'}
            Headliner Cleaning{'\n'}
            Air Vent Cleaning{'\n'}
            Interior Odor Elimination
          </Text>
        )}
        <TouchableOpacity onPress={() => toggleDropdown('ultraDuration')}>
          <Text style={styles.dropdownTitle}>Duration</Text>
        </TouchableOpacity>
        {openDropdown === 'ultraDuration' && (
          <Text style={styles.dropdownContent}>
            120 Minutes*{'\n'}
            Additional 30 Minutes for 3-Row Vehicles
          </Text>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  serviceContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  dropdownTitle: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 5,
  },
  dropdownContent: {
    fontSize: 14,
    color: 'black',
    marginBottom: 10,
  },
});
