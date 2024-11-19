import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { Card } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

export default function AboutScreen() {
  const renderSection = (title, content) => (
    <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>{title}</Card.Title>
        <Card.Divider />
        <Text style={styles.cardContent}>{content}</Text>
      </Card>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ImageBackground
          source={require('../assets/services/full.png')}
          style={styles.headerImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Animatable.Text animation="fadeInDown" duration={1000} style={styles.headerTitle}>
              About Shelby
            </Animatable.Text>
          </LinearGradient>
        </ImageBackground>

        {renderSection(
          "Who We Are",
          "We are a team of industry professionals with nearly 15 years of combined experience in the detailing scene. Shelby Mobile Auto Detailing was born from our vision to offer a more convenient and affordable solution for car care, without sacrificing quality. We recognized the inconvenience and high costs associated with traditional detailing services and decided to create a mobile option that brings exceptional quality and value directly to your doorstep."
        )}

        {renderSection(
          "What We Stand For",
          "Our priority has always been and will always be customer satisfaction. We pride ourselves on using the most trusted equipment, chemicals, and techniques to deliver the best possible results. We are committed to excellence and back our services with a Service Guarantee: if a customer is ever unhappy with any of our services, we will re-evaluate and re-perform the service at no additional cost. Your satisfaction will always be our top priority."
        )}

        {renderSection(
          "Our Services",
          "At Shelby Mobile Auto Detailing, we offer a comprehensive range of premium car care services designed to meet all your detailing needs. From meticulous interior and exterior detailing to advanced paint correction and ceramic coating, our services are tailored to provide your vehicle with the highest level of care. Our expert team uses cutting-edge techniques and top-quality products to ensure your car looks and feels brand new. Experience the convenience and excellence of our mobile detailing solutions, all delivered right to your doorstep."
        )}

        {renderSection(
          "Why Choose Shelby",
          "Shelby Mobile Auto Detailing stands out because we prioritize your convenience without compromising on quality. Unlike traditional services, we bring the detail shop to you, transforming your car at your home or office. Our team of seasoned professionals is dedicated to excellence, utilizing industry-leading equipment and techniques. What truly sets us apart is our unwavering commitment to customer satisfaction, backed by our Service Guarantee. We believe in building trust and delivering results that exceed expectations, ensuring your car receives the finest care with the least disruption to your schedule. Experience detailing redefined with Shelby Mobile Auto Detailing."
        )}
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
  headerImage: {
    width: '100%',
    height: 200,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F5C518',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderWidth: 0,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 5,
  },
  cardTitle: {
    color: '#F5C518',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardContent: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 24,
  },
});