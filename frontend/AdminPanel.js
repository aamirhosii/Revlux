// frontend/AdminPanel.js

"use client";

import { useState, useEffect } from "react";
import {
  View, Text, SafeAreaView, TouchableOpacity,
  FlatList, RefreshControl, Alert, StyleSheet
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function AdminPanel() {
  const [bookings, setBookings]       = useState([]);
  const [bookingFilter, setBookingFilter] = useState("pending");
  const [isLoading, setIsLoading]     = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => { fetchBookings() }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const resp  = await axios.get("http://localhost:5001/bookings", {
        headers:{ Authorization:`Bearer ${token}` }
      });
      setBookings(resp.data);
    } catch(err) {
      Alert.alert("Error","Failed to fetch bookings");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const confirmBooking = bookingId => {
    Alert.alert(
      "Confirm Booking",
      "Send confirmation to customer?",
      [
        { text:"Cancel", style:"cancel" },
        {
          text:"Confirm",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.patch(
                `http://localhost:5001/bookings/${bookingId}/status`,
                { status:'confirmed' },
                { headers:{ Authorization:`Bearer ${token}` } }
              );
              fetchBookings();
              Alert.alert("Booking Confirmed","Customer notified");
            } catch {
              Alert.alert("Error","Could not confirm");
            }
          }
        }
      ]
    );
  };

  const rejectBooking = bookingId => {
    Alert.prompt(
      "Reject Booking",
      "Enter reason:",
      [
        { text:"Cancel", style:"cancel" },
        {
          text:"Reject",
          style:"destructive",
          onPress: async reason => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.patch(
                `http://localhost:5001/bookings/${bookingId}/status`,
                { status:'rejected', cancellationReason: reason },
                { headers:{ Authorization:`Bearer ${token}` } }
              );
              fetchBookings();
              Alert.alert("Booking Rejected","Customer notified");
            } catch {
              Alert.alert("Error","Could not reject");
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const renderBookingItem = ({ item }) => {
    if (bookingFilter!=='all' && item.status!==bookingFilter) return null;
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.customerName}>{item.user.name}</Text>
            <Text style={styles.bookingDate}>
              {new Date(item.appointmentDate).toLocaleDateString()} @ {item.startTime}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            item.status==='confirmed'? styles.confirmedBadge :
            item.status==='rejected'? styles.rejectedBadge :
            styles.pendingBadge
          ]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.divider}/>
        <Text>Service: {item.service}</Text>
        {item.status==='pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.rejectButton} onPress={()=>rejectBooking(item._id)}>
              <Text style={styles.rejectButtonText}>REJECT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={()=>confirmBooking(item._id)}>
              <Text style={styles.confirmButtonText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        {["pending","confirmed","all"].map(f=>(
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, bookingFilter===f&&styles.activeFilterTab]}
            onPress={()=>setBookingFilter(f)}
          >
            <Text style={[styles.filterText, bookingFilter===f&&styles.activeFilterText]}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={b=>b._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true); fetchBookings();
          }}/>
        }
        ListEmptyComponent={!isLoading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc"/>
            <Text style={styles.emptyText}>No {bookingFilter} bookings found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:"#f2f2f2" },
  filterContainer:{ flexDirection:"row", marginBottom:15, justifyContent:"center" },
  filterTab:{ paddingVertical:8, paddingHorizontal:16, marginHorizontal:5, backgroundColor:"#e0e0e0", borderRadius:20 },
  activeFilterTab:{ backgroundColor:"#000" },
  filterText:{ color:"#666" },
  activeFilterText:{ color:"#fff" },
  bookingCard:{ backgroundColor:"#fff", borderRadius:8, padding:15, marginBottom:12 },
  bookingHeader:{ flexDirection:"row", justifyContent:"space-between", marginBottom:10 },
  customerName:{ fontSize:16, fontWeight:"600" },
  bookingDate:{ color:"#666" },
  divider:{ height:1, backgroundColor:"#eee", marginVertical:10 },
  statusBadge:{ padding:6, borderRadius:12 },
  pendingBadge:{ backgroundColor:"#fff3e0" },
  confirmedBadge:{ backgroundColor:"#e8f5e9" },
  rejectedBadge:{ backgroundColor:"#ffebee" },
  statusText:{ fontWeight:"600" },
  actionButtons:{ flexDirection:"row", justifyContent:"space-between", marginTop:10 },
  rejectButton:{ flex:1, padding:10, backgroundColor:"#ffe0e0", borderRadius:6, marginRight:5, alignItems:"center" },
  confirmButton:{ flex:1, padding:10, backgroundColor:"#e0ffe0", borderRadius:6, marginLeft:5, alignItems:"center" },
  rejectButtonText:{ color:"#a00" },
  confirmButtonText:{ color:"#0a0" },
  emptyContainer:{ flex:1, alignItems:"center", marginTop:50 },
  emptyText:{ color:"#666", marginTop:10 }
});