// ServicesStack.js - Enhanced version
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ServicesScreen from './ServicesScreen';
import DetailingScreen from './DetailingScreen';
import CoatingScreen from './CoatingScreen';

const Stack = createStackNavigator();

const CustomHeader = ({ navigation, title, showBack = false }) => {
  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#F5C518" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.headerButton}
          >
            <Ionicons name="menu-outline" size={24} color="#F5C518" />
          </TouchableOpacity>
        )}
        
        <View style={styles.headerTitleContainer}>
          <Image 
            source={require('../assets/logo-small.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {/* Add action here */}}
        >
          <Ionicons name="notifications-outline" size={24} color="#F5C518" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default function ServicesStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
      />
      <Stack.Screen
        name="Detailing"
        component={DetailingScreen}
      />
      <Stack.Screen
        name="Coating"
        component={CoatingScreen}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 50, // Adjust for status bar
    paddingBottom: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});