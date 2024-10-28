import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Switch } from 'react-native';

export default function Settings() {
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(false);
  const [isEmailsEnabled, setIsEmailsEnabled] = useState(false);
  const [isTextMessagesEnabled, setIsTextMessagesEnabled] = useState(false);

  const togglePushNotifications = () => setIsPushNotificationsEnabled(previousState => !previousState);
  const toggleEmails = () => setIsEmailsEnabled(previousState => !previousState);
  const toggleTextMessages = () => setIsTextMessagesEnabled(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsContainer}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isPushNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={togglePushNotifications}
            value={isPushNotificationsEnabled}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Emails</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEmailsEnabled ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleEmails}
            value={isEmailsEnabled}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Text Messages</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isTextMessagesEnabled ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleTextMessages}
            value={isTextMessagesEnabled}
          />
        </View>
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
  settingsContainer: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
  },
});

