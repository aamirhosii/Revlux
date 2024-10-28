import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const renderSection = (title, description, buttonText, onPress, imagePath) => (
    <ImageBackground
      source={imagePath}
      style={styles.sectionBackground}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={onPress}>
            <Text style={styles.sectionButtonText}>{buttonText}</Text>
            <Icon name="chevron-right" type="feather" color="#F5C518" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Animatable.Image
            animation="fadeIn"
            duration={1500}
            source={require('./assets/logo.png')}
            style={styles.logo}
          />

          <ImageBackground
            source={require('./assets/services/interior.png')}
            style={styles.heroBanner}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            >
              <Animatable.View animation="fadeInUp" delay={500} style={styles.heroContent}>
                <Text style={styles.heroTitle}>Toronto's Premium Mobile Car Detailing Service</Text>
                <Text style={styles.heroSubtitle}>Premium Car Detailing, Delivered to Your Doorsteps.</Text>
              </Animatable.View>
            </LinearGradient>
          </ImageBackground>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Expert Mobile Car Detailing at Your Convenience</Text>
            <View style={styles.featuresContainer}>
              {['Right in your Driveway', 'Mobile Detailing', 'Premium Care, Budget-Friendly'].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="check-circle" type="feather" color="#F5C518" size={20} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.descriptionText}>
              Shelby Auto Detailing brings professional car detailing directly to you, eliminating the hassle of traveling to a shop. Experience exceptional mobile detailing for your vehicle without leaving home. Proudly serving Toronto and the GTA.
            </Text>
          </View>

          {renderSection(
            "About Us",
            "Shelby Mobile Auto Detailing brings top-tier car detailing solutions right to your doorstep, combining luxury and convenience without breaking the bank. Our expert team pampers your vehicle with meticulous attention, ensuring it looks its absolute best. Enjoy a premium detailing experience that's both affordable and hassle-free.",
            "About Us",
            () => navigation.navigate('AboutScreen'),
            require('./assets/services/exterior.png')
          )}

          {renderSection(
            "MOBILE DETAILING",
            "Experience the convenience of our mobile detailing services, where our professionals bring meticulous care directly to your doorstep. From interior deep cleans to exterior polishing, we ensure your car looks and feels brand new.",
            "Explore Detailing",
            () => navigation.navigate('Detailing'),
            require('./assets/services/detailing.png')
          )}

          {renderSection(
            "MOBILE CERAMIC COATING",
            "Protect your vehicle with our premium ceramic coating services. Our experts apply advanced coatings to provide long-lasting shine and superior protection, all from the comfort of your home. Ensure your car's finish stays immaculate with our top-tier service.",
            "Explore Coating",
            () => navigation.navigate('Coating'),
            require('./assets/services/coating.png')
          )}

          <View style={styles.buttonsContainer}>
            <Button
              title="View Our Services"
              buttonStyle={[styles.button, styles.goldButton]}
              titleStyle={styles.buttonTitle}
              icon={
                <Icon
                  name="list"
                  type="feather"
                  color="#000"
                  size={20}
                  iconStyle={{ marginRight: 10 }}
                />
              }
              onPress={() => navigation.navigate('Services')}
            />
            <Button
              title="Book an Appointment"
              buttonStyle={[styles.button, styles.goldButton]}
              titleStyle={styles.buttonTitle}
              icon={
                <Icon
                  name="calendar"
                  type="feather"
                  color="#000"
                  size={20}
                  iconStyle={{ marginRight: 10 }}
                />
              }
              onPress={() => navigation.navigate('Booking')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  heroBanner: {
    width: '100%',
    height: 300,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5C518',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    margin: 20,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 15,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  descriptionText: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 24,
  },
  sectionBackground: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5C518',
    marginBottom: 10,
  },
  sectionDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 197, 24, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  sectionButtonText: {
    color: '#F5C518',
    fontWeight: 'bold',
    marginRight: 5,
  },
  buttonsContainer: {
    width: '90%',
    marginBottom: 40,
  },
  button: {
    marginBottom: 15,
    borderRadius: 25,
    paddingVertical: 15,
  },
  goldButton: {
    backgroundColor: '#F5C518',
  },
  buttonTitle: {
    color: '#000',
    fontWeight: 'bold',
  },
});