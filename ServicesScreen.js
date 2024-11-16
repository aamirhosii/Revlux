import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Carousel, { Pagination } from 'react-native-snap-carousel';

// Import the AddOn component
import AddOn from './AddOn';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
const { width: screenWidth } = Dimensions.get('window');

function DetailingScreen({ navigation }) {
  const [activePackage, setActivePackage] = useState(0);
  const carouselRef = useRef(null);
  const packages = [
    {
      id: 'core',
      name: 'CORE™',
      image: require('./assets/core-car.png'),
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
      image: require('./assets/pro-car.png'),
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
      image: require('./assets/ultra-car.png'),
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

  const renderPackage = ({ item, index }) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => setActivePackage(index)}
      activeOpacity={0.9}
    >
      <View style={styles.packageContent}>
        <Text style={styles.packageTitle}>{item.name}</Text>
        <Image source={item.image} style={styles.packageImage} resizeMode="contain" />
        <Text style={styles.packagePrice}>{item.price}</Text>
        <Text style={styles.packageDuration}>{item.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>LUXURY DETAILING</Text>
        <Text style={styles.subHeader}>Experience Premium Car Care at Your Doorstep</Text>

        <Carousel
          ref={carouselRef}
          data={packages}
          renderItem={renderPackage}
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
              <MaterialCommunityIcons name="check-circle" size={20} color="#000000" />
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
          <Text style={styles.bookNowText}>BOOK {packages[activePackage].name}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function CeramicCoatingScreen({ navigation }) {
  const [activePackage, setActivePackage] = useState(0);
  const carouselRef = useRef(null);

  const packages = [
    {
      id: 'sapphire',
      name: 'SAPPHIRE™',
      image: require('./assets/Sapphire.png'),
      description: [
        'Exterior Foam Wash',
        'Exterior Contact Wash',
        'Tire & Wheel Detail',
        'Tire & Wheel Dressing',
        'Break Dust Removal',
        'Road Film & Iron Decontamination',
        'Paint Decontamination (Clay Bar Treatment)',
        '1 - Step Paint Correction & Polish',
        'Exterior Ceramic Coating (2 Years)',
      ],
      duration: '90 Minutes*',
      price: '$129',
    },
    {
      id: 'emerald',
      name: 'EMERALD™',
      image: require('./assets/Emerald.png'),
      description: [
        'All SAPPHIRE™ services plus:',
        'Window Ceramic Coating (12+ Months)',
        'Exterior Ceramic Coating (5 Years)',
      ],
      duration: '440 Minutes*',
      price: '$199',
    },
    {
      id: 'diamond',
      name: 'DIAMOND™',
      image: require('./assets/Diamond.png'),
      description: [
        'All EMERALD™ services plus:',
        'Wheel Ceramic Coating (12+ Months)',
        'Exterior Ceramic Coating (9 Years)',
      ],
      duration: '180 Minutes*',
      price: '$299',
    },
  ];

  const renderPackage = ({ item, index }) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => setActivePackage(index)}
      activeOpacity={0.9}
    >
      <View style={styles.packageContent}>
        <Text style={styles.packageTitle}>{item.name}</Text>
        <Image source={item.image} style={styles.packageImage} resizeMode="contain" />
        <Text style={styles.packagePrice}>{item.price}</Text>
        <Text style={styles.packageDuration}>{item.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>LUXURY DETAILING</Text>
        <Text style={styles.subHeader}>Experience Premium Car Care at Your Doorstep</Text>

        <Carousel
          ref={carouselRef}
          data={packages}
          renderItem={renderPackage}
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
              <MaterialCommunityIcons name="check-circle" size={20} color="#000000" />
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
          <Text style={styles.bookNowText}>BOOK {packages[activePackage].name}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ServicesTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#000000',
        tabBarIndicatorStyle: { backgroundColor: '#000000' },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: '#000000',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen name="Detailing" component={DetailingScreen} />
      <Tab.Screen name="Ceramic Coating" component={CeramicCoatingScreen} />
    </Tab.Navigator>
  );
}

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ServicesTabs />
    </SafeAreaView>
  );
}


function getHeaderTitle(route) {
  const routeName = route.state?.routes[route.state.index]?.name ?? 'Packages';

  switch (routeName) {
    case 'Detailing':
      return 'Detailing Packages';
    case 'Ceramic Coating':
      return 'Ceramic Coating Packages';
    default:
      return 'Our Services';
  }
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flexGrow: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 0,
    marginBottom: 10,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  packageCard: {
    width: screenWidth - 60,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  packageContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  packageImage: {
    width: '80%',
    height: 120,
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  packageDuration: {
    fontSize: 16,
    color: '#555555',
  },
  paginationContainer: {
    paddingVertical: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    backgroundColor: '#000000',
  },
  paginationInactiveDot: {
    backgroundColor: '#888888',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 10,
  },
  bookNowButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
    marginTop: 20,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    width: '100%',
  },
  addOnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  addOnPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  checkoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 20,
    paddingTop: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
});