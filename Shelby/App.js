import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import Contact from './src/screens/Contact';
import DetailingServices from './src/screens/DetailingServices';
import Account from './src/screens/Account';
import CreateAccount from './src/screens/CreateAccount';
import Settings from './src/screens/Settings';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="DetailingServices" component={DetailingServices} />
        <Stack.Screen name="Account" component={Account} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
