// DetailingScreen.js - Enhanced version
import React from 'react';
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
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const PackageCard = ({ title, price, duration, features, isPopular }) => {
  return (
    <View style={[styles.packageCard, isPopular && styles.popularPackage]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      <Text style={styles.packageTitle}>{title}</Text>
      <Text style={styles.packagePrice}>{price}</Text>
      <Text style={styles.packageDuration}>{duration}</Text>
      
      <View style={styles.packageDivider} />
      
      {features.map((feature, index) => (
        <View key={index} style={styles.packageFeature}>
          <Ionicons name="checkmark-circle" size={18} color="#F5C518" />
          <Text style={styles.packageFeatureText}>{feature}</Text>
        </View>
      ))}
      
      <TouchableOpacity style={[styles.selectButton, isPopular && styles.popularSelectButton]}>
        <Text style={[styles.selectButtonText, isPopular && styles.popularSelectButtonText]}>
          SELECT
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DetailingScreen({ navigation }) {
  const packages = [
    {
      id: 'core',
      title: 'CORE™',
      price: '$129',
      duration: '90 Minutes*',
      isPopular: false,
      features: [
        'Comprehensive Vacuum',
        'Dashboard Dusting',
        'Door Panel Cleaning',
        'Window Cleaning',
        'Floor Mat Cleaning'
      ]
    },
    {
      id: 'pro',
      title: 'PRO™',
      price: '$199',
      duration: '120 Minutes*',
      isPopular: true,
      features: [
        'All CORE™ services',
        'Interior Deep Steam',
        'Carpet Shampoo',
        'Leather Conditioning',
        'Trim Restoration'
      ]
    },
    {
      id: 'ultra',
      title: 'ULTRA™',
      price: '$299',
      duration: '180 Minutes*',
      isPopular: false,
      features: [
        'All PRO™ services',
        'Interior Ceramic Coating',
        'Deep Extraction Vacuum',
        'Headliner Cleaning',
        'Odor Elimination'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', '#1a1a1a']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>LUXURY DETAILING</Text>
            <View style={styles.headerUnderline} />
            <Text style={styles.headerSubtitle}>Experience Premium Car Care at Your Doorstep</Text>
          </View>
        </LinearGradient>
        
        <Image 
          source={require('../assets/detailing-hero.png')} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.description}>
            Experience the convenience of our professional mobile detailing services. 
            We bring our expertise directly to your location, ensuring your vehicle 
            receives top-notch care without you having to leave your home or office.
          </Text>
          
          <Text style={styles.sectionTitle}>Choose Your Package</Text>
          
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => (
              <PackageCard 
                key={pkg.id}
                title={pkg.title} 
                price={pkg.price} 
                duration={pkg.duration}
                features={pkg.features}
                isPopular={pkg.isPopular}
              />
            ))}
          </View>
          
          <View style={styles.processSection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.processStep}>
              <View style={styles.processNumberContainer}>
                <Text style={styles.processNumber}>1</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>Choose Your Package</Text>
                <Text style={styles.processDescription}>
                  Select the detailing package that best suits your vehicle's needs.
                </Text>
              </View>
            </View>
            
            <View style={styles.processStep}>
              <View style={styles.processNumberContainer}>
                <Text style={styles.processNumber}>2</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>Schedule Your Appointment</Text>
                <Text style={styles.processDescription}>
                  Pick a date and time that works for your schedule.
                </Text>
              </View>
            </View>
            
            <View style={styles.processStep}>
              <View style={styles.processNumberContainer}>
                <Text style={styles.processNumber}>3</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>We Come To You</Text>
                <Text style={styles.processDescription}>
                  Our professional team arrives at your location with all necessary equipment.
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.bookNowButton}
            onPress={() => navigation.navigate('Services')}
          >
            <LinearGradient
              colors={['#F5C518', '#E6B400']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookNowGradient}
            >
              <Text style={styles.bookNowText}>VIEW ALL PACKAGES</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F5C518',
    textAlign: 'center',
    letterSpacing: 2,
  },
  headerUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#F5C518',
    marginVertical: 15,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  heroImage: {
    width: screenWidth,
    height: 220,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 20,
  },
  packagesContainer: {
    marginBottom: 40,
  },
  packageCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  popularPackage: {
    borderColor: '#F5C518',
    borderWidth: 2,
    position: 'relative',
    paddingTop: 30,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popularBadgeText: {
    backgroundColor: '#F5C518',
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 10,
  },
  packagePrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  packageDuration: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 15,
  },
  packageDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 15,
  },
  packageFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageFeatureText: {
    fontSize: 14,
    color: '#e0e0e0',
    marginLeft: 10,
  },
  selectButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  popularSelectButton: {
    backgroundColor: '#F5C518',
  },
  selectButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  popularSelectButtonText: {
    color: '#000',
  },
  processSection: {
    marginBottom: 30,
  },
  processStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  processNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5C518',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  processNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  processContent: {
    flex: 1,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  processDescription: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
  },
  bookNowButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  bookNowGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookNowText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});