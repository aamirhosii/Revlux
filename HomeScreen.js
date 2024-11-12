import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Section = ({ title, onPress }) => (
  <TouchableOpacity style={styles.section} onPress={onPress}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ImageBackground
          source={require('./assets/services/interior.png')}
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

        <View style={styles.sectionsContainer}>
          <Section
            title="Our Services"
            onPress={() => navigation.navigate('Services')}
          />
          <Section
            title="Make a Booking"
            onPress={() => navigation.navigate('Booking')}
          />
          <Section
            title="Contact Us"
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
    backgroundColor: '#000',
  },
  scrollView: {
    flexGrow: 1,
  },
  heroImage: {
    width: '100%',
    height: height * 0.6,
    justifyContent: 'flex-end',
  },
  heroGradient: {
    padding: 20,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  sectionsContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
});