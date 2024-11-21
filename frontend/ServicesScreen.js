import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Carousel, { Pagination } from 'react-native-snap-carousel';

const { width: screenWidth } = Dimensions.get('window');

const PackageCard = ({ item }) => {
  return (
    <View style={styles.packageCard}>
      <Text style={styles.packageTitle}>{item.name}</Text>
      <Image source={item.image} style={styles.packageImage} resizeMode="contain" />
      <Text style={styles.packagePrice}>{item.price}</Text>
      <Text style={styles.packageDuration}>{item.duration}</Text>
    </View>
  );
};

const ServiceSection = ({ packages, title, subTitle, navigation }) => {
  const [activePackage, setActivePackage] = useState(0);
  const carouselRef = useRef(null);

  return (
    <View style={styles.serviceSection}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>{subTitle}</Text>

      <Carousel
        ref={carouselRef}
        data={packages}
        renderItem={({ item }) => <PackageCard item={item} />}
        sliderWidth={screenWidth}
        itemWidth={screenWidth - 60}
        onSnapToItem={(index) => setActivePackage(index)}
        containerCustomStyle={styles.carouselContainer}
      />

      <Pagination
        dotsLength={packages.length}
        activeDotIndex={activePackage}
        containerStyle={styles.paginationContainer}
        dotStyle={styles.paginationDot}
        inactiveDotStyle={styles.paginationInactiveDot}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />

      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Service Details</Text>
        {packages[activePackage].description.map((item, index) => (
          <View key={index} style={styles.detailItem}>
            <Ionicons name="checkmark-circle" size={20} color="#000" />
            <Text style={styles.detailText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.bookNowButton}
        onPress={() => {
          navigation.navigate('AddOnsScreen', {
            selectedPackage: packages[activePackage],
          });
        }}
      >
        <LinearGradient
          colors={['#000', '#333']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bookNowGradient}
        >
          <Text style={styles.bookNowText}>BOOK {packages[activePackage].name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default function LuxuryCarService({ navigation }) {
  const [activeService, setActiveService] = useState('detailing');

  const detailingPackages = [
    {
      id: 'core',
      name: 'CORE™',
      image: require('../assets/core-car.png'),
      description: [
        'Comprehensive Vacuum Cleaning',
        'Dashboard Dusting & Wipe Down',
        'Door Panel Cleaning',
        'Window & Mirror Cleaning',
        'Floor Mat Cleaning',
      ],
      duration: '90 Minutes*',
      price: '$129',
    },
    {
      id: 'pro',
      name: 'PRO™',
      image: require('../assets/pro-car.png'),
      description: [
        'All CORE™ services plus:',
        'Interior Deep Steam Cleaning',
        'Carpet & Floor Mat Shampoo',
        'Leather Cleaning & Conditioning',
      ],
      duration: '120 Minutes*',
      price: '$199',
    },
    {
      id: 'ultra',
      name: 'ULTRA™',
      image: require('../assets/ultra-car.png'),
      description: [
        'All PRO™ services plus:',
        'Interior Ceramic Coating',
        'Extractor Vacuum Deep Cleaning',
        'Headliner Cleaning',
        'Air Vent Cleaning',
        'Interior Odor Elimination',
      ],
      duration: '180 Minutes*',
      price: '$299',
    },
  ];

  const ceramicCoatingPackages = [
    {
      id: 'sapphire',
      name: 'SAPPHIRE™',
      image: require('../assets/Sapphire.png'),
      description: [
        'Exterior Foam Wash',
        'Exterior Contact Wash',
        'Tire & Wheel Detail',
        'Paint Decontamination',
        '1-Step Paint Correction',
        'Exterior Ceramic Coating (2 Years)',
      ],
      duration: '4 Hours*',
      price: '$699',
    },
    {
      id: 'emerald',
      name: 'EMERALD™',
      image: require('../assets/Emerald.png'),
      description: [
        'All SAPPHIRE™ services plus:',
        'Window Ceramic Coating',
        '2-Step Paint Correction',
        'Exterior Ceramic Coating (5 Years)',
      ],
      duration: '6 Hours*',
      price: '$999',
    },
    {
      id: 'diamond',
      name: 'DIAMOND™',
      image: require('../assets/Diamond.png'),
      description: [
        'All EMERALD™ services plus:',
        'Wheel Ceramic Coating',
        '3-Step Paint Correction',
        'Exterior Ceramic Coating (9 Years)',
      ],
      duration: '8 Hours*',
      price: '$1499',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeService === 'detailing' && styles.activeTab]}
            onPress={() => setActiveService('detailing')}
          >
            <Text style={[styles.tabText, activeService === 'detailing' && styles.activeTabText]}>
              Detailing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeService === 'ceramicCoating' && styles.activeTab]}
            onPress={() => setActiveService('ceramicCoating')}
          >
            <Text
              style={[styles.tabText, activeService === 'ceramicCoating' && styles.activeTabText]}
            >
              Ceramic Coating
            </Text>
          </TouchableOpacity>
        </View>
        {activeService === 'detailing' ? (
          <ServiceSection
            packages={detailingPackages}
            title="LUXURY DETAILING"
            subTitle="Experience Premium Car Care at Your Doorstep"
            navigation={navigation}
          />
        ) : (
          <ServiceSection
            packages={ceramicCoatingPackages}
            title="CERAMIC COATING"
            subTitle="Ultimate Protection, Unmatched Shine"
            navigation={navigation}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: '#000',
  },
  serviceSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subHeader: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  packageCard: {
    width: screenWidth - 60,
    height: 350,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 15,
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  packageImage: {
    width: '80%',
    height: 150,
    marginVertical: 15,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  packageDuration: {
    fontSize: 16,
    color: '#555',
  },
  paginationContainer: {
    paddingVertical: 8,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: '#000',
  },
  paginationInactiveDot: {
    backgroundColor: '#888',
  },
  detailsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  bookNowButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
  },
  bookNowGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  bookNowText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
