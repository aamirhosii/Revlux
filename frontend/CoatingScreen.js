// CoatingScreen.js - Enhanced version
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
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const FeatureCard = ({ icon, title, description }) => {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={28} color="#F5C518" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
};

export default function CoatingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', '#1a1a1a']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>CERAMIC COATING</Text>
            <View style={styles.headerUnderline} />
            <Text style={styles.headerSubtitle}>Ultimate Protection, Unmatched Shine</Text>
          </View>
        </LinearGradient>
        
        <Image 
          source={require('../assets/ceramic-coating-hero.png')} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.description}>
            Our ceramic coating services provide long-lasting protection for your vehicle's paint, 
            creating a hydrophobic surface that repels water, dirt, and contaminants while enhancing 
            the depth and gloss of your paint.
          </Text>
          
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Benefits of Ceramic Coating</Text>
            
            <FeatureCard 
              icon="shield-checkmark" 
              title="Long-Lasting Protection" 
              description="Our coatings provide up to 9 years of protection against environmental damage."
            />
            
            <FeatureCard 
              icon="water" 
              title="Hydrophobic Properties" 
              description="Water and contaminants slide right off, making cleaning easier."
            />
            
            <FeatureCard 
              icon="sunny" 
              title="UV Protection" 
              description="Prevents paint oxidation and fading from harsh sunlight."
            />
            
            <FeatureCard 
              icon="sparkles" 
              title="Enhanced Gloss" 
              description="Provides a deep, mirror-like finish that enhances your vehicle's appearance."
            />
          </View>
          
          <View style={styles.packageSection}>
            <Text style={styles.sectionTitle}>Our Coating Packages</Text>
            
            <View style={styles.packageCard}>
              <View style={styles.packageBadge}>
                <Text style={styles.packageBadgeText}>SAPPHIRE™</Text>
              </View>
              <View style={styles.packageContent}>
                <Text style={styles.packagePrice}>$699</Text>
                <Text style={styles.packageDuration}>4 Hours*</Text>
                <View style={styles.packageDivider} />
                <View style={styles.packageFeature}>
                  <Ionicons name="checkmark-circle" size={18} color="#F5C518" />
                  <Text style={styles.packageFeatureText}>2-Year Protection</Text>
                </View>
                <View style={styles.packageFeature}>
                  <Ionicons name="checkmark-circle" size={18} color="#F5C518" />
                  <Text style={styles.packageFeatureText}>1-Step Paint Correction</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Services')}
            >
              <Text style={styles.viewAllText}>VIEW ALL PACKAGES</Text>
              <Ionicons name="arrow-forward" size={18} color="#F5C518" />
            </TouchableOpacity>
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
              <Text style={styles.bookNowText}>EXPLORE PACKAGES</Text>
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
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(245, 197, 24, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
  },
  packageSection: {
    marginBottom: 30,
  },
  packageCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  packageBadge: {
    backgroundColor: '#F5C518',
    paddingVertical: 10,
    alignItems: 'center',
  },
  packageBadgeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  packageContent: {
    padding: 20,
  },
  packagePrice: {
    fontSize: 32,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  viewAllText: {
    fontSize: 16,
    color: '#F5C518',
    fontWeight: 'bold',
    marginRight: 10,
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