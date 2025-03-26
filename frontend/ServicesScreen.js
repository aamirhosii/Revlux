// ServicesScreen.js - White Background, Single Header, Black Text
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
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Carousel, { Pagination } from 'react-native-snap-carousel';

const { width: screenWidth } = Dimensions.get('window');

const PackageCard = ({ item, isActive }) => {
  // Animated "pop" scale for the active carousel card
  const scaleAnim = new Animated.Value(isActive ? 1 : 0.95);

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1 : 0.95,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.packageCard,
        {
          transform: [{ scale: scaleAnim }],
        },
        isActive && styles.activePackageCard,
      ]}
    >
      {/* Top Badge */}
      <View style={styles.packageBadge}>
        <Text style={styles.packageBadgeText}>{item.name}</Text>
      </View>

      {/* Car Image (centered) */}
      <View style={styles.cardImageContainer}>
        <Image source={item.image} style={styles.packageImage} resizeMode="contain" />
      </View>

      {/* Price & Duration */}
      <View style={styles.packagePriceContainer}>
        <Text style={styles.packagePrice}>{item.price}</Text>
        <Text style={styles.packageDuration}>{item.duration}</Text>
      </View>

      {/* "Tap for details" label */}
      <View style={styles.packageHighlights}>
        <Text style={styles.highlightText}>Tap for details</Text>
      </View>
    </Animated.View>
  );
};

const ServiceSection = ({ packages, title, subTitle, navigation }) => {
  const [activePackage, setActivePackage] = useState(0);
  const carouselRef = useRef(null);

  return (
    <View style={styles.serviceSection}>
      {/* Section Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{title}</Text>
        <View style={styles.headerUnderline} />
        <Text style={styles.subHeader}>{subTitle}</Text>
      </View>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        data={packages}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              // Could navigate to details or show a modal
            }}
          >
            <PackageCard item={item} isActive={index === activePackage} />
          </TouchableOpacity>
        )}
        sliderWidth={screenWidth}
        itemWidth={screenWidth - 80}
        onSnapToItem={(index) => setActivePackage(index)}
        containerCustomStyle={styles.carouselContainer}
        inactiveSlideScale={0.9}
        inactiveSlideOpacity={0.5}
      />

      {/* Pagination */}
      <Pagination
        dotsLength={packages.length}
        activeDotIndex={activePackage}
        containerStyle={styles.paginationContainer}
        dotStyle={styles.paginationDot}
        inactiveDotStyle={styles.paginationInactiveDot}
        inactiveDotOpacity={0.3}
        inactiveDotScale={0.7}
      />

      {/* Package Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Service Details</Text>
          <Text style={styles.detailsSubtitle}>
            {packages[activePackage].name} Package
          </Text>
        </View>
        <View style={styles.detailsContent}>
          {packages[activePackage].description.map((desc, idx) => (
            <View key={idx} style={styles.detailItem}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
              <Text style={styles.detailText}>{desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Book Now Button */}
      <TouchableOpacity
        style={styles.bookNowButton}
        onPress={() =>
          navigation.navigate('AddOnsScreen', {
            selectedPackage: packages[activePackage],
          })
        }
      >
        <View style={styles.bookNowSolid}>
          <Text style={styles.bookNowText}>
            BOOK {packages[activePackage].name}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function ServicesScreen({ navigation }) {
  const [activeService, setActiveService] = useState('detailing');

  // Sample package data
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
      <StatusBar barStyle="dark-content" />

      {/* 
        We removed the old custom navBar to avoid a second header.
        The Stack Navigator (ServicesStack.js) now handles the top header.
      */}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeService === 'detailing' && styles.activeTab,
          ]}
          onPress={() => setActiveService('detailing')}
        >
          <Ionicons
            name="car-outline"
            size={16}
            color={activeService === 'detailing' ? '#fff' : '#000'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeService === 'detailing' && styles.activeTabText,
            ]}
          >
            Detailing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeService === 'ceramicCoating' && styles.activeTab,
          ]}
          onPress={() => setActiveService('ceramicCoating')}
        >
          <Ionicons
            name="shield-outline"
            size={16}
            color={activeService === 'ceramicCoating' ? '#fff' : '#000'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeService === 'ceramicCoating' && styles.activeTabText,
            ]}
          >
            Ceramic Coating
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.container} bounces={false}>
        {activeService === 'detailing' ? (
          <ServiceSection
            packages={detailingPackages}
            title="Luxury Detailing"
            subTitle="Experience Premium Car Care at Your Doorstep"
            navigation={navigation}
          />
        ) : (
          <ServiceSection
            packages={ceramicCoatingPackages}
            title="Ceramic Coating"
            subTitle="Ultimate Protection, Unmatched Shine"
            navigation={navigation}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Safe Area */
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Tab Bar Styles */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: '#fff',
  },

  /* Service Section */
  serviceSection: {
    paddingTop: 25,
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerUnderline: {
    width: 40,
    height: 2,
    backgroundColor: '#000',
    marginVertical: 6,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  carouselContainer: {
    marginBottom: 20,
  },

  /* Package Cards */
  packageCard: {
    height: 350,
    borderRadius: 15,
    backgroundColor: '#eee',
    marginVertical: 10,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  activePackageCard: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  packageBadge: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#ccc',
  },
  packageBadgeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageImage: {
    width: '70%',
    height: 140,
  },
  packagePriceContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  packageDuration: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  packageHighlights: {
    alignItems: 'center',
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  /* Pagination */
  paginationContainer: {
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 3,
  },
  paginationInactiveDot: {
    backgroundColor: '#aaa',
  },

  /* Details Box */
  detailsContainer: {
    backgroundColor: '#f7f7f7',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 25,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  detailsHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  detailsContent: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },

  /* Book Now Button */
  bookNowButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  bookNowSolid: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 8,
    textTransform: 'uppercase',
  },
});