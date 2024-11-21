//AvailabilityScreen.js
import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useGetLocation } from './hooks/useGetLocation';

const Tab = createMaterialTopTabNavigator();

// const getLocation = async () => {
//   try {
//     const res = await fetch(
//       "https://api.radar.io/v1/track", {
//         method: "POST",
//         headers: {
//           "Authorization": "prj_test_pk_685572677b745d626df2cefe3e9f9ca9b4562f41",
//         },
//         body: new URLSearchParams({
//           deviceID: "1234567890",
//           latitude: "54.486457",
//           longitude: "-0.624798",
//           accuracy: "65"
//         }),
//       }
//     )

//     if (res.ok) {
//       const data = await res.json();
//       console.log("Tracking Success", JSON.stringify(data.user));
//       console.log(data.user.country.code)
//       console.log(data.user.state.name)
//     } else {
//       const errorText = await res.text();
//       console.log("Error", `Status: ${res.status}, Message: ${errorText}`);
//     }


//   } catch (err) {
//     console.log("Network Error", err.message)
//   }

// }

export default function AvailabilityScreen() {
  //uses Hook placed in hook directory to prompt and get user location from device
  const [lat, lon] = useGetLocation();
  console.log(`Latitude: ${lat}`);
  console.log(`Longitude: ${lon}`);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Availability Check</Text>
          <Text style={styles.description}>
            Check Availability Here
          </Text>
          {}
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