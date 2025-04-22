"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

const { width: screenWidth } = Dimensions.get("window")

// Tab data for interior/exterior toggle
const TABS = [
  { id: "interior", label: "INTERIOR" },
  { id: "exterior", label: "EXTERIOR" },
]

// Package data
const INTERIOR_PACKAGES = [
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
    isPopular: true,
    features: [
      "Intensive complete vacuuming of the entire interior",
      "Thorough wipe down & sanitization of all surfaces & crevices",
      "Deep steam shampooing of all carpets, seats, & mats",
      "Premium leather seats conditioning treatment",
      "Streak-free cleaning of all window & mirrors",
      "Vinyl polish finishing for shine & protection on all interior surfaces",
    ],
  },
]

const EXTERIOR_PACKAGES = [
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
    isPopular: true,
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "One year ceramic sealant",
    ],
  },
]

const ADDONS = [
  { id: "pet-hair", title: "Pet Hair Removal", price: "$29" },
  { id: "7-seater", title: "7 Seaters Interior", price: "$19 extra" },
  { id: "glass-ceramic", title: "Glass Ceramic Coating", price: "$169" },
  { id: "odor-removal", title: "Odor Removal", price: "$89" },
]

const PackageCard = ({ title, price, features, isPopular, onSelect }) => {
  return (
    <View style={[styles.packageCard, isPopular && styles.popularPackage]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>RECOMMENDED</Text>
        </View>
      )}
      <View style={styles.packageHeader}>
        <Text style={styles.packageTitle}>{title}</Text>
        <Text style={styles.packagePrice}>{price}</Text>
      </View>

      <View style={styles.packageDivider} />

      {features.map((feature, index) => (
        <View key={index} style={styles.packageFeature}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
          <Text style={styles.packageFeatureText}>{feature}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.selectButton, isPopular && styles.popularSelectButton]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectButtonText, isPopular && styles.popularSelectButtonText]}>SELECT</Text>
      </TouchableOpacity>
    </View>
  )
}

const AddonItem = ({ title, price, onSelect, isSelected }) => {
  return (
    <TouchableOpacity
      style={[styles.addonItem, isSelected && styles.addonItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.addonContent}>
        <Text style={styles.addonTitle}>{title}</Text>
        <Text style={styles.addonPrice}>{price}</Text>
      </View>
      <View style={[styles.addonCheckbox, isSelected && styles.addonCheckboxSelected]}>
        {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  )
}

export default function DetailingScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("interior")
  const [selectedAddons, setSelectedAddons] = useState([])

  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId))
    } else {
      setSelectedAddons([...selectedAddons, addonId])
    }
  }

  const packages = activeTab === "interior" ? INTERIOR_PACKAGES : EXTERIOR_PACKAGES

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{activeTab === "interior" ? "INTERIOR DETAILING" : "EXTERIOR DETAILING"}</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri:
                activeTab === "interior"
                  ? "https://via.placeholder.com/800x400?text=Interior+Detailing"
                  : "https://via.placeholder.com/800x400?text=Exterior+Detailing",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <BlurView intensity={60} tint="dark" style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{activeTab === "interior" ? "INTERIOR" : "EXTERIOR"}</Text>
            <Text style={styles.heroSubtitle}>DETAILING SERVICES</Text>
          </BlurView>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {/* Description */}
          <Text style={styles.description}>
            {activeTab === "interior"
              ? "Our interior detailing services restore and protect your vehicle's cabin, removing dirt, stains, and odors while conditioning surfaces for a fresh, clean interior."
              : "Our exterior detailing services remove contaminants, restore shine, and protect your vehicle's paint from environmental damage and UV rays."}
          </Text>

          {/* Packages */}
          <Text style={styles.sectionTitle}>SELECT A PACKAGE</Text>

          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              title={pkg.title}
              price={pkg.price}
              features={pkg.features}
              isPopular={pkg.isPopular}
              onSelect={() => navigation.navigate("Booking")}
            />
          ))}

          {/* Add-ons */}
          <Text style={styles.sectionTitle}>ENHANCE YOUR SERVICE</Text>
          <View style={styles.addonsContainer}>
            {ADDONS.map((addon) => (
              <AddonItem
                key={addon.id}
                title={addon.title}
                price={addon.price}
                isSelected={selectedAddons.includes(addon.id)}
                onSelect={() => toggleAddon(addon.id)}
              />
            ))}
          </View>

          {/* Process Section */}
          <Text style={styles.sectionTitle}>OUR PROCESS</Text>

          <View style={styles.processContainer}>
            <View style={styles.processStep}>
              <View style={styles.processNumberContainer}>
                <Text style={styles.processNumber}>01</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>Select Your Package</Text>
                <Text style={styles.processDescription}>
                  Choose the detailing package that best suits your vehicle's needs.
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.processNumberContainer}>
                <Text style={styles.processNumber}>02</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>Schedule Appointment</Text>
                <Text style={styles.processDescription}>Pick a date and time that works for your schedule.</Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.processNumberContainer}>
                <Text style={styles.processNumber}>03</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>We Come To You</Text>
                <Text style={styles.processDescription}>
                  Our professional team arrives at your location with all necessary equipment.
                </Text>
              </View>
            </View>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() => navigation.navigate("Booking")}
            activeOpacity={0.9}
          >
            <Text style={styles.bookNowText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  heroContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    margin: 16,
    borderRadius: 12,
    padding: 4,
    marginTop: -20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 1,
  },
  activeTabText: {
    color: "#000",
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    marginTop: 24,
    letterSpacing: 1,
  },
  packageCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  popularPackage: {
    borderColor: "#fff",
    position: "relative",
    paddingTop: 32,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  popularBadgeText: {
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    letterSpacing: 1,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  packageDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 16,
  },
  packageFeature: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  packageFeatureText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
  },
  popularSelectButton: {
    backgroundColor: "#000",
  },
  selectButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 1,
  },
  popularSelectButtonText: {
    color: "#fff",
  },
  addonsContainer: {
    backgroundColor: "#111",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  addonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  addonItemSelected: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  addonContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 16,
  },
  addonTitle: {
    fontSize: 16,
    color: "#fff",
  },
  addonPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  addonCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  addonCheckboxSelected: {
    backgroundColor: "#000",
  },
  processContainer: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  processStep: {
    flexDirection: "row",
    marginBottom: 20,
  },
  processNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  processNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  processContent: {
    flex: 1,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  processDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  bookNowButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 32,
  },
  bookNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
})
