import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Button, Card, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import ConfettiCannon from 'react-native-confetti-cannon';
import logo from './assets/logo.png';

const { width, height } = Dimensions.get('window');

const services = [
  {
    id: 1,
    title: 'Exterior Detailing',
    description: 'Complete exterior cleaning and polishing.',
    image: require('./assets/services/exterior.png'),
  },
  {
    id: 2,
    title: 'Interior Detailing',
    description: 'Deep cleaning of the interior spaces.',
    image: require('./assets/services/interior.png'),
  },
  {
    id: 3,
    title: 'Full-Service Package',
    description: 'Comprehensive detailing inside and out.',
    image: require('./assets/services/full.png'),
  },
];

export default function HomeScreen() {
  const [confetti, setConfetti] = useState(false);

  const handleAppointment = () => {
    // Your booking logic here
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a1a1a', '#333333']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Animatable.Image
            animation="fadeInDown"
            duration={1000}
            source={logo}
            style={styles.logo}
          />
          <Animatable.Text
            animation="fadeInUp"
            delay={500}
            style={styles.title}
          >
            Shelby Auto Detailing
          </Animatable.Text>
          <Animatable.Text
            animation="fadeInUp"
            delay={700}
            style={styles.subtitle}
          >
            Premier Detailing Services in Canada
          </Animatable.Text>
          <View style={styles.servicesSection}>
            {services.map(service => (
              <Animatable.View
                animation="fadeInUp"
                delay={service.id * 200}
                key={service.id}
              >
                <Card containerStyle={styles.card}>
                  <Image source={service.image} style={styles.serviceImage} />
                  <Card.Title style={styles.cardTitle}>{service.title}</Card.Title>
                  <Card.Divider />
                  <Text style={styles.cardDescription}>{service.description}</Text>
                  <Button
                    title="Learn More"
                    buttonStyle={styles.learnMoreButton}
                    icon={
                      <Icon
                        name="arrow-right"
                        type="feather"
                        color="#fff"
                        size={20}
                        iconStyle={{ marginLeft: 10 }}
                      />
                    }
                  />
                </Card>
              </Animatable.View>
            ))}
          </View>
          <View style={styles.buttonsContainer}>
            <Animatable.View animation="fadeInUp" delay={1000}>
              <Button
                title="View Our Services"
                buttonStyle={styles.button}
                icon={
                  <Icon
                    name="list"
                    type="feather"
                    color="#fff"
                    size={20}
                    iconStyle={{ marginRight: 10 }}
                  />
                }
                onPress={() => {}}
              />
            </Animatable.View>
            <Animatable.View animation="fadeInUp" delay={1200}>
              <Button
                title="Book an Appointment"
                buttonStyle={styles.button}
                icon={
                  <Icon
                    name="calendar"
                    type="feather"
                    color="#fff"
                    size={20}
                    iconStyle={{ marginRight: 10 }}
                  />
                }
                onPress={handleAppointment}
              />
            </Animatable.View>
            <Animatable.View animation="fadeInUp" delay={1400}>
              <Button
                title="Contact Us"
                buttonStyle={styles.button}
                icon={
                  <Icon
                    name="phone"
                    type="feather"
                    color="#fff"
                    size={20}
                    iconStyle={{ marginRight: 10 }}
                  />
                }
                onPress={() => {}}
              />
            </Animatable.View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Shelby Auto Detailing. All rights reserved.
            </Text>
          </View>
          {confetti && (
            <ConfettiCannon
              count={100}
              origin={{ x: -10, y: 0 }}
              fadeOut={true}
              autoStart={true}
              explosionSpeed={350}
              fallSpeed={3000}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#F5C518', // Gold color for premium look
    fontFamily: 'Helvetica Neue',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#e0e0e0', // Light grey subtitle
    fontFamily: 'Helvetica Neue',
  },
  servicesSection: {
    width: '100%',
    marginBottom: 30,
  },
  card: {
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 20,
    backgroundColor: '#2b2b2b', // Dark card background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  serviceImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardTitle: {
    marginTop: 10,
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  cardDescription: {
    marginBottom: 15,
    textAlign: 'left',
    paddingHorizontal: 15,
    color: '#ccc', // Soft grey text for description
    fontSize: 16,
  },
  learnMoreButton: {
    backgroundColor: '#F5C518', // Gold accent
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#F5C518', // Gold accent
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#444',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Helvetica Neue',
  },
});
