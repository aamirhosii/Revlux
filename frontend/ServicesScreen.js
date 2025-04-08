"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  TextInput,
  Modal,
} from "react-native"
import { Calendar } from "react-native-calendars"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import * as Location from "expo-location"

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

// Service areas - cities where we provide service
const SERVICE_AREAS = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
]

// 6 Services (labels + internal values)
const SERVICE_TYPES = [
  { label: "CORE™ (90 Min)", value: "CORE" },
  { label: "PRO™ (120 Min)", value: "PRO" },
  { label: "ULTRA™ (180 Min)", value: "ULTRA" },
  { label: "SAPPHIRE™ (~4h)", value: "SAPPHIRE" },
  { label: "EMERALD™ (~6h)", value: "EMERALD" },
  { label: "DIAMOND™ (~8h)", value: "DIAMOND" },
]

const { width: screenWidth } = Dimensions.get("window")

export default function BookingScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedService, setSelectedService] = useState("CORE")
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Location and service area states
  const [locationVerified, setLocationVerified] = useState(false)
  const [checkingLocation, setCheckingLocation] = useState(false)
  const [zipCode, setZipCode] = useState("")
  const [locationModalVisible, setLocationModalVisible] = useState(true)
  const [locationError, setLocationError] = useState(null)

  // Request permissions on mount
  useEffect(() => {
    requestNotificationPermission()
    checkLocationPermission()
  }, [])

  /**
   * Request and check location permission
   */
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        // If permission granted, try to get location automatically
        getLocationAndVerify()
      } else {
        // If permission denied, we'll rely on manual zip code entry
        setLocationError("Location permission denied. Please enter your zip code manually.")
      }
    } catch (error) {
      console.error("Error requesting location permission:", error)
      setLocationError("Error accessing location services. Please enter your zip code manually.")
    }
  }

  /**
   * Get user's current location and verify if it's in service area
   */
  const getLocationAndVerify = async () => {
    setCheckingLocation(true)
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      // Get city name from coordinates
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (geocode && geocode.length > 0) {
        const city = geocode[0].city

        // Check if city is in our service areas
        if (city && SERVICE_AREAS.includes(city)) {
          setLocationVerified(true)
          setLocationModalVisible(false)
          Alert.alert("Great News!", `We provide service in ${city}. You can now book an appointment.`)
        } else {
          setLocationError(`Sorry, we don't currently provide service in ${city || "your area"}.`)
        }
      } else {
        setLocationError("Unable to determine your city. Please enter your zip code manually.")
      }
    } catch (error) {
      console.error("Error getting location:", error)
      setLocationError("Error determining your location. Please enter your zip code manually.")
    } finally {
      setCheckingLocation(false)
    }
  }

  /**
   * Verify service availability by zip code
   */
  const verifyZipCode = async () => {
    if (!zipCode || zipCode.length < 5) {
      Alert.alert("Invalid Zip Code", "Please enter a valid zip code.")
      return
    }

    setCheckingLocation(true)
    try {
      // Call backend to verify zip code is in service area
      const response = await axios.get(`http://localhost:5001/service-areas/check?zipCode=${zipCode}`)

      if (response.data.available) {
        setLocationVerified(true)
        setLocationModalVisible(false)
        Alert.alert("Great News!", `We provide service in ${response.data.city}. You can now book an appointment.`)
      } else {
        setLocationError(`Sorry, we don't currently provide service in ${response.data.city || "your area"}.`)
      }
    } catch (error) {
      console.error("Error verifying zip code:", error)
      setLocationError("Error verifying your location. Please try again or contact support.")
    } finally {
      setCheckingLocation(false)
    }
  }

  /**
   * Request notification permission
   */
  const requestNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.log("Notifications permission not granted!")
    }
  }

  /**
   * Show a local push notification after successful booking
   */
  const showBookingNotification = async (service, date, startTime, endTime) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Booking Confirmed!",
        body: `${service} booked on ${date} from ${startTime} to ${endTime}.`,
        data: { service, date, startTime, endTime },
      },
      trigger: null, // Fire instantly (no delay)
    })
  }

  // Fetch available slots from server for the chosen date & service
  const fetchAvailableSlots = async (dateString) => {
    setLoadingSlots(true)
    try {
      const response = await axios.get("http://localhost:5001/availability")

      const dateOnly = new Date(dateString)
      dateOnly.setHours(0, 0, 0, 0)

      const found = response.data.find((avail) => {
        const d = new Date(avail.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === dateOnly.getTime()
      })

      if (!found) {
        setAvailableSlots([])
        setLoadingSlots(false)
        return
      }

      // Filter slots for (service === selectedService) and isAvailable
      const filteredSlots = found.timeSlots.filter((ts) => ts.serviceType === selectedService && ts.isAvailable)
      setAvailableSlots(filteredSlots)
    } catch (error) {
      console.error("Error fetching availability:", error)
      Alert.alert("Error", "Unable to fetch available slots.")
    }
    setLoadingSlots(false)
  }

  // Called when user taps a date on the Calendar
  const onDayPress = (day) => {
    setSelectedDate(day.dateString)
    fetchAvailableSlots(day.dateString)
  }

  // Called when user taps a time slot
  const bookSlot = async (slot) => {
    if (!locationVerified) {
      setLocationModalVisible(true)
      return
    }

    if (!selectedDate) {
      Alert.alert("Select Date", "Please select a date first.")
      return
    }

    try {
      const token = await AsyncStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:5001/bookings",
        {
          service: selectedService,
          appointmentDate: selectedDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.status === 201) {
        Alert.alert("Success", "Booking confirmed!")
        // Refresh the slots
        fetchAvailableSlots(selectedDate)

        // Show local push notification
        showBookingNotification(selectedService, selectedDate, slot.startTime, slot.endTime)
      }
    } catch (error) {
      console.error("Booking error:", error.response ? error.response.data : error)
      Alert.alert("Booking Error", error.response?.data?.message || "Error booking slot.")
    }
  }

  // Called when user taps a service button
  const onSelectService = (serviceValue) => {
    setSelectedService(serviceValue)
    // If a date is already selected, refetch the slots
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Location Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModalVisible}
        onRequestClose={() => {
          if (locationVerified) {
            setLocationModalVisible(false)
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Service Availability</Text>
            <Text style={styles.modalSubtitle}>
              We need to check if we provide service in your area before you can book.
            </Text>

            {locationError && <Text style={styles.errorText}>{locationError}</Text>}

            <View style={styles.zipInputContainer}>
              <TextInput
                style={styles.zipInput}
                placeholder="Enter your ZIP code"
                keyboardType="numeric"
                maxLength={5}
                value={zipCode}
                onChangeText={setZipCode}
              />
              <TouchableOpacity style={styles.verifyButton} onPress={verifyZipCode} disabled={checkingLocation}>
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.locationButton} onPress={getLocationAndVerify} disabled={checkingLocation}>
              <Text style={styles.locationButtonText}>
                {checkingLocation ? "Checking..." : "Use My Current Location"}
              </Text>
            </TouchableOpacity>

            {checkingLocation && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

            {locationVerified && (
              <TouchableOpacity style={styles.continueButton} onPress={() => setLocationModalVisible(false)}>
                <Text style={styles.continueButtonText}>Continue to Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Hero / Header Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{ uri: "https://via.placeholder.com/1200x400?text=Shelby+Auto+Detailing" }}
          style={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Book an Appointment</Text>
            <Text style={styles.heroSubtitle}>Select a service and date below</Text>
          </View>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!locationVerified && (
          <TouchableOpacity style={styles.verifyLocationBanner} onPress={() => setLocationModalVisible(true)}>
            <Text style={styles.verifyLocationText}>Please verify your location to continue booking</Text>
          </TouchableOpacity>
        )}

        {/* SERVICE SELECTION (BUTTONS) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Choose a Service</Text>
          <View style={styles.serviceButtonRow}>
            {SERVICE_TYPES.map((item) => {
              const isActive = item.value === selectedService
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.serviceButton, isActive && styles.serviceButtonActive]}
                  onPress={() => onSelectService(item.value)}
                >
                  <Text style={[styles.serviceButtonText, isActive && styles.serviceButtonTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* CALENDAR PICKER */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pick a Date</Text>
          <Calendar
            onDayPress={onDayPress}
            markedDates={selectedDate ? { [selectedDate]: { selected: true } } : {}}
            style={styles.calendar}
            theme={{
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500",
              arrowColor: "#000",
            }}
          />
        </View>

        {/* TIME SLOTS */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Available Time Slots {selectedDate ? `on ${selectedDate}` : ""}</Text>

          {loadingSlots ? (
            <ActivityIndicator size="large" color="#000" style={{ marginVertical: 10 }} />
          ) : availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.slotButton, !locationVerified && styles.slotButtonDisabled]}
                onPress={() => bookSlot(slot)}
              >
                <Text style={styles.slotText}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSlotsText}>
              {selectedDate ? "No available slots for this date/service." : "Select a date to see available slots."}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  heroContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#DDD",
    overflow: "hidden",
    marginBottom: 10,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  heroTitle: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFF",
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 3,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },

  // Service Buttons
  serviceButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  serviceButton: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#FFF",
  },
  serviceButtonActive: {
    backgroundColor: "#000",
  },
  serviceButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  serviceButtonTextActive: {
    color: "#FFF",
  },

  calendar: {
    borderRadius: 10,
  },
  slotButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
  },
  slotButtonDisabled: {
    backgroundColor: "#888",
  },
  slotText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  noSlotsText: {
    fontSize: 15,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },

  // Location verification modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  zipInputContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
  },
  zipInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: "#000",
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  locationButton: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  locationButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  verifyLocationBanner: {
    backgroundColor: "#FFEB3B",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  verifyLocationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
})
