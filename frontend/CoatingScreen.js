"use client"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

const { width: screenWidth } = Dimensions.get("window")

// Ceramic coating packages data
const COATING_PACKAGES = [
  {
    id: "sapphire",
    title: "Sapphire",
    price: "$599",
    duration: "3 Years Protection",
    isPopular: false,
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
    title: "Emerald",
    price: "$799",
    duration: "5 Years Protection",
    isPopular: true,
    features: [
      "Professional hand wash & dry of the entire exterior",
      "Streak-free cleaning of all window & mirrors",
      "Deep cleaning of the tires & rims",
      "Tire dressing treatment for enhanced shine",
      "Clay bar treatment",
      "1 step polish",
      "Applying 5 years ceramic coating",
    ],
  },
  {
    id: "diamond",
    title: "Diamond",
    price: "$999",
    duration: "9 Years Protection",
    isPopular: false,
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

const FeatureCard = ({ icon, title, description }) => {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  )
}

const PackageCard = ({ title, price, duration, features, isPopular, onSelect }) => {
  return (
    <View style={[styles.packageCard, isPopular && styles.popularPackage]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.packageHeader}>
        <View>
          <Text style={styles.packageTitle}>{title}</Text>
          <Text style={styles.packageDuration}>{duration}</Text>
        </View>
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

export default function CoatingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CERAMIC COATING</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: "https://via.placeholder.com/800x400?text=Ceramic+Coating" }}
            style={styles.heroImage}
          >
            <BlurView intensity={60} tint="dark" style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                <Text style={styles.heroSubtitle}>PREMIUM</Text>
                <Text style={styles.heroTitle}>CERAMIC COATING</Text>
                <Text style={styles.heroDescription}>Ultimate protection, unmatched shine</Text>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          {/* Introduction */}
          <Text style={styles.description}>
            Our ceramic coating provides superior protection for your vehicle's paint, creating a hydrophobic surface
            that repels water, dirt, and contaminants while enhancing the depth and gloss of your paint for years to
            come.
          </Text>

          {/* Benefits */}
          <Text style={styles.sectionTitle}>BENEFITS</Text>

          <View style={styles.benefitsContainer}>
            <FeatureCard
              icon="shield-outline"
              title="Long-Lasting Protection"
              description="Our coatings provide up to 9 years of protection against environmental damage."
            />

            <FeatureCard
              icon="water-outline"
              title="Hydrophobic Properties"
              description="Water and contaminants slide right off, making cleaning easier."
            />

            <FeatureCard
              icon="sunny-outline"
              title="UV Protection"
              description="Prevents paint oxidation and fading from harsh sunlight."
            />

            <FeatureCard
              icon="sparkles-outline"
              title="Enhanced Gloss"
              description="Provides a deep, mirror-like finish that enhances your vehicle's appearance."
            />
          </View>

          {/* Packages */}
          <Text style={styles.sectionTitle}>COATING PACKAGES</Text>

          {COATING_PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.id}
              title={pkg.title}
              price={pkg.price}
              duration={pkg.duration}
              features={pkg.features}
              isPopular={pkg.isPopular}
              onSelect={() => navigation.navigate("Booking")}
            />
          ))}

          {/* Add-on */}
          <View style={styles.addonCard}>
            <View style={styles.addonHeader}>
              <Text style={styles.addonTitle}>Glass Ceramic Coating</Text>
              <Text style={styles.addonPrice}>$169</Text>
            </View>
            <Text style={styles.addonDescription}>
              Enhance your coating package with our specialized glass ceramic coating for improved visibility in rain
              and easier cleaning of all windows.
            </Text>
            <TouchableOpacity style={styles.addonButton} activeOpacity={0.8}>
              <Text style={styles.addonButtonText}>ADD TO PACKAGE</Text>
            </TouchableOpacity>
          </View>

          {/* Comparison */}
          <Text style={styles.sectionTitle}>PROTECTION COMPARISON</Text>

          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonLabel}>Protection Type</Text>
              <Text style={styles.comparisonLabel}>Durability</Text>
              <Text style={styles.comparisonLabel}>Gloss</Text>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonItem}>Wax</Text>
              <Text style={styles.comparisonItem}>2-3 Months</Text>
              <View style={styles.ratingContainer}>
                <View style={[styles.ratingBar, { width: "40%" }]} />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonItem}>Sealant</Text>
              <Text style={styles.comparisonItem}>6-12 Months</Text>
              <View style={styles.ratingContainer}>
                <View style={[styles.ratingBar, { width: "60%" }]} />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonItem}>Ceramic</Text>
              <Text style={styles.comparisonItem}>3-9 Years</Text>
              <View style={styles.ratingContainer}>
                <View style={[styles.ratingBar, { width: "95%" }]} />
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
    height: 280,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 24,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 24,
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
    marginTop: 32,
    letterSpacing: 1,
  },
  benefitsContainer: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
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
    backgroundColor: "#000",
    color: "#fff",
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  packageDuration: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  packageDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
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
  addonCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#fff",
  },
  addonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  addonPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  addonDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
    marginBottom: 16,
  },
  addonButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  addonButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 1,
  },
  comparisonContainer: {
    backgroundColor: "#111",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  comparisonHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  comparisonRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  comparisonItem: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  ratingContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    alignSelf: "center",
  },
  ratingBar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
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
