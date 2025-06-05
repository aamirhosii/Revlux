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
  const [weekStats, setWeekStats] = useState({ totalHours: '0', daysWorked: 0 });

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchClockHistory();
    return () => clearInterval(timer);
  }, []);
  
  // Fetch clock history from the shifts endpoint
  const fetchClockHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      // Get shifts from API
      const response = await axios.get(`${API_URL}/api/employee/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Shifts API response:', response.data);
      
      // Transform shifts to clock events format
      const formattedEvents = [];
      let daysWorked = new Set();
      let totalHoursWorked = 0;
      
      // Process each shift into clock-in and clock-out events
      if (response.data.shifts && Array.isArray(response.data.shifts)) {
        response.data.shifts.forEach(shift => {
          // Add clock-in event
          if (shift.clockInTime) {
            const clockInDate = new Date(shift.clockInTime);
            formattedEvents.push({
              _id: `in-${shift.id || Math.random().toString()}`,
              type: 'clock-in',
              timestamp: shift.clockInTime,
              notes: shift.notes?.clockIn || ''
            });
            
            // Track unique days worked
            daysWorked.add(clockInDate.toLocaleDateString());
          }
          
          // Add clock-out event if exists
          if (shift.clockOutTime) {
            formattedEvents.push({
              _id: `out-${shift.id || Math.random().toString()}`,
              type: 'clock-out',
              timestamp: shift.clockOutTime,
              notes: shift.notes?.clockOut || ''
            });
          }
          
          // Add hours for completed shifts
          if (shift.duration) {
            totalHoursWorked += shift.duration;
          }
        });
      }
      
      // Sort by timestamp, newest first
      formattedEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Update state
      setClockHistory(formattedEvents);
      setWeekStats({
        totalHours: totalHoursWorked.toFixed(1),
        daysWorked: daysWorked.size
      });
      
    } catch (error) {
      console.error("Error fetching clock history:", error.response?.data?.message || error.message);
      // Don't show alert for 404 errors during development
      if (error.response?.status !== 404) {
        Alert.alert("Error", "Could not fetch clock history");
      }
    } finally {
      setHistoryLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClockHistory();
  }, [fetchClockHistory]);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/employee/clock-in`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Clock in response:", response.data);
      
      updateClockInStatus(true, response.data.clockInTime);
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
      
      console.log("Clock out response:", response.data);
      
      updateClockInStatus(false, null);
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
    return `${hours}:${minutes}:${seconds}`;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading user data...</Text>
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
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons 
              name={isClockedIn ? "log-out-outline" : "log-in-outline"} 
              size={22} 
              color="#fff" 
              style={{marginRight: 8}} 
            />
            <Text style={styles.buttonText}>{isClockedIn ? 'Clock Out' : 'Clock In'}</Text>
          </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('EmployeeAssignedJobs')}>
        <Ionicons name="list-circle-outline" size={20} color="#fff" style={{marginRight: 10}} />
        <Text style={styles.buttonText}>View Assigned Jobs</Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <Text style={styles.statusTitle}>This Week's Summary</Text>
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={20} color="#555" style={{marginRight: 10}} />
          <Text style={styles.summaryText}>
            Total Hours Worked: {weekStats.totalHours} hours
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="calendar-outline" size={20} color="#555" style={{marginRight: 10}} />
          <Text style={styles.summaryText}>
            Days Worked: {weekStats.daysWorked} days
          </Text>
        </View>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Clock In/Out History</Text>
        {historyLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#000"/> 
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : clockHistory.length === 0 ? (
          <Text style={styles.noHistoryText}>No clock history available.</Text>
        ) : (
          <>
            {clockHistory.slice(0, 10).map(event => (
              <View key={event._id} style={styles.historyItem}>
                <Ionicons 
                  name={event.type === 'clock-in' ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                  size={20}
                  color={event.type === 'clock-in' ? "#4CAF50" : "#F44336"}
                  style={styles.historyIcon}
                />
                <View style={styles.historyDetails}>
                  <Text style={styles.historyEventType}>
                    {event.type === 'clock-in' ? 'Clock In' : 'Clock Out'}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(event.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))}

            {clockHistory.length > 10 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => Alert.alert("Full History", "Complete clock history will be available in a future update.")}
              >
                <Text style={styles.viewAllText}>View All History</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#555',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#F44336',
  },
  navButton: {
    backgroundColor: '#2196F3',
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
    paddingVertical: 12,
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
  },
  historyDetails: {
    flex: 1,
  },
  historyEventType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  historyTime: {
    fontSize: 13,
    color: '#666',
  },
  viewAllButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  viewAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
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
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
  }
});