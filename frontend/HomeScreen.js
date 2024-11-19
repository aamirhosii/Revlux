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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Section = ({ title, iconName, onPress }) => (
  <TouchableOpacity style={styles.section} onPress={onPress}>
    <Ionicons name={iconName} size={24} color="#000" style={styles.sectionIcon} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
        >
          <Ionicons name="menu-outline" size={32} color="#000" />
        </TouchableOpacity>
      ),
      headerTitle: '',
      headerTransparent: true,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.heroContainer}>
          <ImageBackground
            source={require('../assets/services/interior.png')}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: height * 0.1,
    marginTop: 20,
    marginBottom: 40,
  },
  heroContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  heroImage: {
    width: '100%',
    height: height * 0.35,
    justifyContent: 'flex-end',
  },
  heroGradient: {
    padding: 20,
    height: '50%',
    justifyContent: 'flex-end',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sectionsContainer: {
    width: '90%',
    paddingVertical: 20,
  },
  section: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionIcon: {
    marginRight: 15,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  menuButton: {
    marginLeft: 15,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
});