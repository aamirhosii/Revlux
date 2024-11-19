// LogoutScreen.js
import React, { useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from './AppNavigator';

export default function LogoutScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    const logout = async () => {
      await signOut();
      // No need to navigate manually; AppNavigator will handle it
    };
    logout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );
}
