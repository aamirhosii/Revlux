import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ServicesScreen from './ServicesScreen';

const Stack = createStackNavigator();

export default function ServicesStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          headerTitle: 'Our Services',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()} // Open the drawer
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu-outline" size={32} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
