import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Section = ({ title, iconName, onPress }) => (
  <TouchableOpacity style={styles.section} onPress={onPress}>
    <Ionicons name={iconName} size={24} color="#000" style={styles.sectionIcon} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  // Use layout effect to remove the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.heroContainer}>
          <ImageBackground
            source={require('./assets/services/interior.png')}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent']}
              style={styles.heroGradient}
            >
              <Text style={styles.heroTitle}>Premium Mobile Auto Detailing</Text>
            </LinearGradient>
          </ImageBackground>
        </View>
        <View style={styles.sectionsContainer}>
          <Section
            title="Our Services"
            iconName="car-outline"
            onPress={() => navigation.navigate('Services')}
          />
          <Section
            title="Make a Booking"
            iconName="calendar-outline"
            onPress={() => navigation.navigate('Booking')}
          />
          <Section
            title="Contact Us"
            iconName="call-outline"
            onPress={() => navigation.navigate('Contact')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: height * 0.1,
    marginTop: 20,
    marginBottom: 60,
  },
  heroContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 40, // Add spacing between hero and sections
  },
  heroImage: {
    width: '100%', // Set to full width to avoid cut-off
    height: height * 0.40, // Adjust height as needed
    justifyContent: 'flex-end',
    borderRadius: 15,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 20,
    height: '50%', // Extend gradient for better text visibility
    justifyContent: 'flex-end',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10, // Add some bottom padding to text
  },
  sectionsContainer: {
    width: '90%',
    paddingVertical: 20,
    marginTop: 20, // Additional top spacing
  },
  section: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 10,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
  },
});
