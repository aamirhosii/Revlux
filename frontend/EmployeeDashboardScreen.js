"use client"

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { AuthContext } from './AppNavigator';
import axios from 'axios';
import { API_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function EmployeeDashboardScreen({ navigation }) {
  const { user, token, isClockedIn, lastClockInTime, updateClockInStatus, signOut } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockHistory, setClockHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchClockHistory();
    return () => clearInterval(timer);
  }, []);
  
  const fetchClockHistory = useCallback(async () => {
     if (!token) return;
     setHistoryLoading(true);
     try {
         const response = await axios.get(`${API_URL}/api/employee/clock-history`, {
             headers: { Authorization: `Bearer ${token}` },
         });
         setClockHistory(response.data);
     } catch (error) {
         console.error("Error fetching clock history:", error.response?.data?.message || error.message);
         Alert.alert("Error", "Could not fetch clock history.");
     } finally {
         setHistoryLoading(false);
         setRefreshing(false);
     }
  }, [token]);

  const onRefresh = useCallback(() => {
     setRefreshing(true);
     // Optionally re-fetch employee status if it can change server-side without app interaction
     // Example: fetchEmployeeStatus(); 
     fetchClockHistory();
  }, [fetchClockHistory]);


  const handleClockIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/employee/clock-in`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateClockInStatus(true, response.data.lastClockInTime);
      Alert.alert("Success", "You have clocked in.");
      fetchClockHistory(); // Refresh history
    } catch (error) {
      console.error("Clock-in error:", error.response?.data?.message || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to clock in.");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/employee/clock-out`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateClockInStatus(false, null); // lastClockInTime could be set to null or the clockOutTime
      Alert.alert("Success", "You have clocked out.");
      fetchClockHistory(); // Refresh history
    } catch (error) {
      console.error("Clock-out error:", error.response?.data?.message || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to clock out.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
     if (!dateString) return 'N/A';
     const date = new Date(dateString);
     return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  const calculateDuration = () => {
     if (!isClockedIn || !lastClockInTime) return "00:00:00";
     const diff = currentTime.getTime() - new Date(lastClockInTime).getTime();
     const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
     const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
     const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
     return `<span class="math-inline">\{hours\}\:</span>{minutes}:${seconds}`;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Employee Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <View style={styles.statusInfo}>
          <Ionicons 
             name={isClockedIn ? "time" : "time-outline"} 
             size={28} 
             color={isClockedIn ? "#4CAF50" : "#F44336"} 
          />
          <Text style={[styles.statusText, { color: isClockedIn ? '#4CAF50' : '#F44336' }]}>
            You are currently {isClockedIn ? 'Clocked In' : 'Clocked Out'}
          </Text>
        </View>
        {isClockedIn && lastClockInTime && (
          <>
             <Text style={styles.detailText}>Clocked In At: {formatDateTime(lastClockInTime)}</Text>
             <Text style={styles.detailTextBold}>Current Shift Duration: {calculateDuration()}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isClockedIn ? styles.clockOutButton : styles.clockInButton]}
        onPress={isClockedIn ? handleClockOut : handleClockIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isClockedIn ? 'Clock Out' : 'Clock In'}</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('EmployeeAssignedJobs')}>
         <Ionicons name="list-circle-outline" size={20} color="#fff" style={{marginRight: 10}} />
         <Text style={styles.buttonText}>View Assigned Jobs</Text>
      </TouchableOpacity>

      <View style={styles.historyCard}>
         <Text style={styles.historyTitle}>Recent Activity</Text>
         {historyLoading ? <ActivityIndicator size="small" color="#000"/> :
           clockHistory.length === 0 ? <Text style={styles.noHistoryText}>No recent activity.</Text> :
           clockHistory.slice(0, 5).map(event => ( // Show last 5 events
             <View key={event._id} style={styles.historyItem}>
                 <Ionicons 
                     name={event.type === 'clock-in' ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                     size={20}
                     color={event.type === 'clock-in' ? "green" : "red"}
                     style={styles.historyIcon}
                 />
                 <Text style={styles.historyText}>
                     {event.type === 'clock-in' ? 'Clocked In: ' : 'Clocked Out: '}
                     {formatDateTime(event.timestamp)}
                 </Text>
             </View>
           ))
         }
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    backgroundColor: '#000',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: '#333',
     marginBottom: 15,
     textAlign: 'center',
  },
  statusInfo: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  detailText: {
     fontSize: 14,
     color: '#555',
     textAlign: 'center',
     marginBottom: 5,
  },
  detailTextBold: {
     fontSize: 15,
     color: '#333',
     fontWeight: 'bold',
     textAlign: 'center',
     marginTop: 5,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  clockInButton: {
    backgroundColor: '#4CAF50', // Green for clock-in
  },
  clockOutButton: {
    backgroundColor: '#F44336', // Red for clock-out
  },
  navButton: {
     backgroundColor: '#2196F3', // Blue for navigation
     paddingVertical: 15,
     paddingHorizontal: 20,
     borderRadius: 25,
     alignItems: 'center',
     marginHorizontal: 20,
     marginBottom: 20,
     flexDirection: 'row',
     justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
     backgroundColor: '#fff',
     borderRadius: 12,
     padding: 20,
     marginHorizontal: 20,
     marginBottom: 20,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 3,
     elevation: 2,
  },
  historyTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: '#333',
     marginBottom: 15,
  },
  historyItem: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingVertical: 8,
     borderBottomWidth: 1,
     borderBottomColor: '#eee',
  },
  historyIcon: {
     marginRight: 10,
  },
  historyText: {
     fontSize: 14,
     color: '#555',
  },
  noHistoryText: {
     fontSize: 14,
     color: '#777',
     textAlign: 'center',
     paddingVertical: 10,
  }
});