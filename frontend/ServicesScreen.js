"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { AuthContext } from "./AppNavigator"
import axios from "axios"
import { API_URL, SERVICE_TYPES } from "../config"

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

// Service data
const INTERIOR_SERVICES = [
  {
    id: "mini-interior",
    title: "Mini Interior Detail",
    price: "$109",
    features: [
      "Vacuuming of the entire interior surfaces",
      "Thorough wipe down of all surfaces & crevices",
      "Cleaning of all window & mirrors",
    ],
  },
  {
    id: "full-interior",
    title: "Full Interior Detail",
    price: "$189",
    features: [
      "Intensive complete vacuuming of the entire interior",
      "Thorough wipe down & sanitization of all surfaces & crevices",
      "Deep steam shampooing of all carpets, seats, & mats",
      "Premium leather seats conditioning treatment",
      "Streak-free cleaning of all window & mirrors",
      "Vinyl polish finishing for shine & protection on all interior surfaces",
    ],
    recommended: true,
  },
]

const EXTERIOR_SERVICES = [
  {
    id: "mini-exterior",
    title: "Mini Exterior Detail",
    price: "$59",
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "High-gloss, hydrophobic wax coating application on the paint",
    ],
  },
  {
    id: "full-exterior",
    title: "Full Exterior Detail",
    price: "$159",
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "One year ceramic sealant",
    ],
    recommended: true,
  },
]

const CERAMIC_PACKAGES = [
  {
    id: "sapphire",
    title: "Sapphire Ceramic Coating",
    price: "$599",
    duration: "3 Years Protection",
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "Clay bar treatment",
      "1 step polish",
      "Applying 3 years ceramic coating",
    ],
  },
  {
    id: "emerald",
    title: "Emerald Ceramic Coating",
    price: "$799",
    duration: "5 Years Protection",
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "Clay bar treatment",
      "1 step polish",
      "Applying 5 years ceramic coating",
    ],
    recommended: true,
  },
  {
    id: "diamond",
    title: "Diamond Ceramic Coating",
    price: "$999",
    duration: "9 Years Protection",
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "Clay bar treatment",
      "1 step polish",
      "Applying 9 years ceramic coating",
    ],
  },
]

const ADDONS = [
  { id: "pet-hair", title: "Pet Hair Removal", price: "$29" },
  { id: "7-seater", title: "7 Seaters Interior", price: "$19 extra" },
  { id: "glass-ceramic", title: "Glass Ceramic Coating", price: "$169" },
  { id: "odor-removal", title: "Odor Removal", price: "$89" },
]

const { width: screenWidth } = Dimensions.get("window")

// Service Card Component
const ServiceCard = ({ service, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.serviceCard, selected && styles.selectedServiceCard]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {service.recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.serviceCardHeader}>
        <Text style={styles.serviceCardTitle}>{service.title}</Text>
        <Text style={styles.serviceCardPrice}>{service.price}</Text>
      </View>

      {service.duration && <Text style={styles.serviceDuration}>{service.duration}</Text>}

      <View style={styles.divider} />

      {service.features.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={18} color="#000" style={styles.featureIcon} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}

      <View style={styles.selectContainer}>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.selectText}>{selected ? "SELECTED" : "SELECT"}</Text>
      </View>
    </TouchableOpacity>
  )
}

// Addon Card Component
const AddonCard = ({ addon, selected, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.addonCard, selected && styles.selectedAddonCard]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.addonInfo}>
        <Text style={styles.addonTitle}>{addon.title}</Text>
        <Text style={styles.addonPrice}>{addon.price}</Text>
      </View>
      <View style={[styles.addonCheckbox, selected && styles.addonCheckboxSelected]}>
        {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  )
}

export default function ServicesScreen({ navigation }) {
  const { user, token } = useContext(AuthContext)
  // Location and service area states
  const [locationVerified, setLocationVerified] = useState(false)
  const [checkingLocation, setCheckingLocation] = useState(false)
  const [zipCode, setZipCode] = useState("")
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [activeTab, setActiveTab] = useState(SERVICE_TYPES.INTERIOR)
  const [selectedServices, setSelectedServices] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    date: "",
    time: "",
    address: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Request permissions on mount
  useEffect(() => {
    checkLocationPermission()
  }, [])

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
      }))
    }
  }, [user])

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
          Alert.alert("Service Available", `We provide service in ${city}. You can now book an appointment.`)
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
      const response = await axios.get(`${API_URL}/api/service-areas/check?zipCode=${zipCode}`)

      if (response.data.available) {
        setLocationVerified(true)
        setLocationModalVisible(false)
        Alert.alert(
          "Service Available",
          `We provide service in ${response.data.city}. You can now book an appointment.`,
        )
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

  // Toggle service selection
  const toggleServiceSelection = (serviceId) => {
    setSelectedServices((prev) => {
      const newSelection = { ...prev }

      // If selecting from interior tab, deselect any previously selected interior service
      if (activeTab === SERVICE_TYPES.INTERIOR && serviceId.includes("interior")) {
        Object.keys(newSelection).forEach((key) => {
          if (key.includes("interior")) {
            delete newSelection[key]
          }
        })
      }

      // If selecting from exterior tab, deselect any previously selected exterior service
      if (activeTab === SERVICE_TYPES.EXTERIOR && serviceId.includes("exterior")) {
        Object.keys(newSelection).forEach((key) => {
          if (key.includes("exterior")) {
            delete newSelection[key]
          }
        })
      }

      // If selecting from ceramic tab, deselect any previously selected ceramic package
      if (
        activeTab === SERVICE_TYPES.CERAMIC &&
        (serviceId.includes("sapphire") || serviceId.includes("emerald") || serviceId.includes("diamond"))
      ) {
        Object.keys(newSelection).forEach((key) => {
          if (key.includes("sapphire") || key.includes("emerald") || key.includes("diamond")) {
            delete newSelection[key]
          }
        })
      }

      // Toggle the selected service
      if (newSelection[serviceId]) {
        delete newSelection[serviceId]
      } else {
        newSelection[serviceId] = true
      }

      return newSelection
    })
  }

  // Toggle addon selection
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) => {
      if (prev.includes(addonId)) {
        return prev.filter((id) => id !== addonId)
      } else {
        return [...prev, addonId]
      }
    })
  }

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Get selected services as formatted strings
  const getSelectedServicesList = () => {
    const selectedServicesList = []

    // Add interior services
    INTERIOR_SERVICES.forEach((service) => {
      if (selectedServices[service.id]) {
        selectedServicesList.push(`${service.title} (${service.price})`)
      }
    })

    // Add exterior services
    EXTERIOR_SERVICES.forEach((service) => {
      if (selectedServices[service.id]) {
        selectedServicesList.push(`${service.title} (${service.price})`)
      }
    })

    // Add ceramic packages
    CERAMIC_PACKAGES.forEach((pkg) => {
      if (selectedServices[pkg.id]) {
        selectedServicesList.push(`${pkg.title} (${pkg.price})`)
      }
    })

    return selectedServicesList
  }

  // Get selected addons as formatted strings
  const getSelectedAddonsList = () => {
    return ADDONS.filter((addon) => selectedAddons.includes(addon.id)).map((addon) => `${addon.title} (${addon.price})`)
  }

  // Submit booking
  const submitBooking = async () => {
    // Validate form
    if (
      !bookingForm.name ||
      !bookingForm.email ||
      !bookingForm.phone ||
      !bookingForm.date ||
      !bookingForm.time ||
      !bookingForm.address
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return
    }

    // Check if at least one service is selected
    if (Object.keys(selectedServices).length === 0) {
      Alert.alert("No Service Selected", "Please select at least one service.")
      return
    }

    // Check if user is logged in
    if (!token) {
      Alert.alert("Login Required", "You need to be logged in to book a service.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ])
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare selected services and addons
      const selectedServicesList = getSelectedServicesList()
      const selectedAddonsList = getSelectedAddonsList()

      // Create booking data
      const bookingData = {
        customerName: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        date: bookingForm.date,
        time: bookingForm.time,
        address: bookingForm.address,
        notes: bookingForm.notes,
        services: selectedServicesList,
        addons: selectedAddonsList,
        total: calculateTotal(),
      }

      // Send booking request to backend
      const response = await axios.post(`${API_URL}/api/bookings`, bookingData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      // Show success message
      Alert.alert(
        "Booking Submitted",
        "Your booking request has been sent to our team. We will contact you shortly to confirm your appointment.",
        [
          {
            text: "OK",
            onPress: () => {
              setBookingModalVisible(false)
              // Reset form and selections
              setBookingForm({
                name: user?.name || "",
                email: user?.email || "",
                phone: user?.phoneNumber || "",
                date: "",
                time: "",
                address: "",
                notes: "",
              })
              setSelectedServices({})
              setSelectedAddons([])
            },
          },
        ],
      )
    } catch (error) {
      console.error("Error submitting booking:", error)
      Alert.alert("Booking Failed", "There was an error submitting your booking. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total price
  const calculateTotal = () => {
    let total = 0

    // Add interior services
    INTERIOR_SERVICES.forEach((service) => {
      if (selectedServices[service.id]) {
        total += Number.parseInt(service.price.replace("$", ""))
      }
    })

    // Add exterior services
    EXTERIOR_SERVICES.forEach((service) => {
      if (selectedServices[service.id]) {
        total += Number.parseInt(service.price.replace("$", ""))
      }
    })

    // Add ceramic packages
    CERAMIC_PACKAGES.forEach((pkg) => {
      if (selectedServices[pkg.id]) {
        total += Number.parseInt(pkg.price.replace("$", ""))
      }
    })

    // Add selected add-ons
    ADDONS.forEach((addon) => {
      if (selectedAddons.includes(addon.id)) {
        // Handle special case for "7 Seaters Interior" which has "extra" in the price
        if (addon.id === "7-seater") {
          total += 19
        } else {
          total += Number.parseInt(addon.price.replace("$", ""))
        }
      }
    })

    return total
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => {
            // Only navigate if user is admin
            if (user?.isAdmin) {
              navigation.navigate("AdminBookings")
            } else {
              Alert.alert("Access Denied", "Only administrators can access this feature.")
            }
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Service Category Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === SERVICE_TYPES.INTERIOR && styles.activeTab]}
          onPress={() => setActiveTab(SERVICE_TYPES.INTERIOR)}
        >
          <Text style={[styles.tabText, activeTab === SERVICE_TYPES.INTERIOR && styles.activeTabText]}>Interior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === SERVICE_TYPES.EXTERIOR && styles.activeTab]}
          onPress={() => setActiveTab(SERVICE_TYPES.EXTERIOR)}
        >
          <Text style={[styles.tabText, activeTab === SERVICE_TYPES.EXTERIOR && styles.activeTabText]}>Exterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === SERVICE_TYPES.CERAMIC && styles.activeTab]}
          onPress={() => setActiveTab(SERVICE_TYPES.CERAMIC)}
        >
          <Text style={[styles.tabText, activeTab === SERVICE_TYPES.CERAMIC && styles.activeTabText]}>Ceramic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === SERVICE_TYPES.ADDONS && styles.activeTab]}
          onPress={() => setActiveTab(SERVICE_TYPES.ADDONS)}
        >
          <Text style={[styles.tabText, activeTab === SERVICE_TYPES.ADDONS && styles.activeTabText]}>Add-ons</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interior Services */}
        {activeTab === SERVICE_TYPES.INTERIOR && (
          <View>
            <Text style={styles.sectionTitle}>Interior Detailing Services</Text>
            <Text style={styles.sectionDescription}>
              Our interior detailing services restore and protect your vehicle's cabin, removing dirt, stains, and odors
              while conditioning surfaces for a fresh, clean interior.
            </Text>

            {INTERIOR_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedServices[service.id]}
                onSelect={() => toggleServiceSelection(service.id)}
              />
            ))}
          </View>
        )}

        {/* Exterior Services */}
        {activeTab === SERVICE_TYPES.EXTERIOR && (
          <View>
            <Text style={styles.sectionTitle}>Exterior Detailing Services</Text>
            <Text style={styles.sectionDescription}>
              Our exterior detailing services remove contaminants, restore shine, and protect your vehicle's paint from
              environmental damage and UV rays.
            </Text>

            {EXTERIOR_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedServices[service.id]}
                onSelect={() => toggleServiceSelection(service.id)}
              />
            ))}
          </View>
        )}

        {/* Ceramic Coating Packages */}
        {activeTab === SERVICE_TYPES.CERAMIC && (
          <View>
            <Text style={styles.sectionTitle}>Ceramic Coating Packages</Text>
            <Text style={styles.sectionDescription}>
              Our ceramic coating provides superior protection for your vehicle's paint, creating a hydrophobic surface
              that repels water, dirt, and contaminants while enhancing the depth and gloss of your paint for years to
              come.
            </Text>

            {CERAMIC_PACKAGES.map((pkg) => (
              <ServiceCard
                key={pkg.id}
                service={pkg}
                selected={selectedServices[pkg.id]}
                onSelect={() => toggleServiceSelection(pkg.id)}
              />
            ))}
          </View>
        )}

        {/* Add-ons */}
        {activeTab === SERVICE_TYPES.ADDONS && (
          <View>
            <Text style={styles.sectionTitle}>Service Add-ons</Text>
            <Text style={styles.sectionDescription}>
              Enhance your detailing service with these additional options to address specific needs of your vehicle.
            </Text>

            {ADDONS.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                selected={selectedAddons.includes(addon.id)}
                onToggle={() => toggleAddon(addon.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Booking Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${calculateTotal()}</Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setBookingModalVisible(true)}
          disabled={Object.keys(selectedServices).length === 0}
        >
          <Text style={styles.bookButtonText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Your Booking</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Enter your full name"
              />

              <Text style={styles.formLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Enter your email address"
                keyboardType="email-address"
              />

              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>Preferred Date *</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.date}
                onChangeText={(text) => handleInputChange("date", text)}
                placeholder="MM/DD/YYYY"
              />

              <Text style={styles.formLabel}>Preferred Time *</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.time}
                onChangeText={(text) => handleInputChange("time", text)}
                placeholder="HH:MM AM/PM"
              />

              <Text style={styles.formLabel}>Service Address *</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.address}
                onChangeText={(text) => handleInputChange("address", text)}
                placeholder="Enter your address"
              />

              <Text style={styles.formLabel}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bookingForm.notes}
                onChangeText={(text) => handleInputChange("notes", text)}
                placeholder="Any special instructions or requests"
                multiline={true}
                numberOfLines={4}
              />

              <Text style={styles.bookingSummaryTitle}>Booking Summary</Text>

              {/* Selected Services */}
              {Object.keys(selectedServices).length > 0 && (
                <View style={styles.summarySection}>
                  <Text style={styles.summarySectionTitle}>Selected Services:</Text>

                  {/* Interior Services */}
                  {INTERIOR_SERVICES.map(
                    (service) =>
                      selectedServices[service.id] && (
                        <View key={service.id} style={styles.summaryItem}>
                          <Text style={styles.summaryItemName}>{service.title}</Text>
                          <Text style={styles.summaryItemPrice}>{service.price}</Text>
                        </View>
                      ),
                  )}

                  {/* Exterior Services */}
                  {EXTERIOR_SERVICES.map(
                    (service) =>
                      selectedServices[service.id] && (
                        <View key={service.id} style={styles.summaryItem}>
                          <Text style={styles.summaryItemName}>{service.title}</Text>
                          <Text style={styles.summaryItemPrice}>{service.price}</Text>
                        </View>
                      ),
                  )}

                  {/* Ceramic Packages */}
                  {CERAMIC_PACKAGES.map(
                    (pkg) =>
                      selectedServices[pkg.id] && (
                        <View key={pkg.id} style={styles.summaryItem}>
                          <Text style={styles.summaryItemName}>{pkg.title}</Text>
                          <Text style={styles.summaryItemPrice}>{pkg.price}</Text>
                        </View>
                      ),
                  )}
                </View>
              )}

              {/* Selected Add-ons */}
              {selectedAddons.length > 0 && (
                <View style={styles.summarySection}>
                  <Text style={styles.summarySectionTitle}>Selected Add-ons:</Text>

                  {ADDONS.map(
                    (addon) =>
                      selectedAddons.includes(addon.id) && (
                        <View key={addon.id} style={styles.summaryItem}>
                          <Text style={styles.summaryItemName}>{addon.title}</Text>
                          <Text style={styles.summaryItemPrice}>{addon.price}</Text>
                        </View>
                      ),
                  )}
                </View>
              )}

              {/* Total */}
              <View style={styles.totalSummary}>
                <Text style={styles.totalSummaryLabel}>Total:</Text>
                <Text style={styles.totalSummaryPrice}>${calculateTotal()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                onPress={submitBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>SUBMIT BOOKING</Text>
                )}
              </TouchableOpacity>

              <View style={styles.spacer} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  adminButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  selectedServiceCard: {
    borderColor: "#000",
    borderWidth: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  recommendedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  serviceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  serviceCardPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  featureRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  featureIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#000",
  },
  selectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  addonCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  selectedAddonCard: {
    borderColor: "#000",
    borderWidth: 2,
  },
  addonInfo: {
    flex: 1,
  },
  addonTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  addonPrice: {
    fontSize: 14,
    color: "#666",
  },
  addonCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  addonCheckboxSelected: {
    backgroundColor: "#000",
  },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  bookButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  formContainer: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  bookingSummaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 10,
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 16,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  totalSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalSummaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  totalSummaryPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#666",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    height: 40,
  },
})
