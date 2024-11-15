import React, { useState } from 'react';
import {SafeAreaView, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure this package is installed

const addOns = [
  {
    id: 'exterior_detail',
    name: 'Exterior Detail',
    price: '$50',
    details: [
      'Exterior Foam Wash',
      'Exterior Contact Wash',
      'Break Dust Removal',
      'Tire & Wheel Detail',
      'Tire & Wheel Dressing',
    ],
  },
  {
    id: 'ceramic_paint_sealant',
    name: 'Ceramic Paint Sealant (12 Months)',
    price: '$150',
    details: [
      'Everything in the Exterior Detail Add-On Plus:',
      'Iron Decon',
      'Paint Decontamination (Clay Bar Treatment)',
      '12-Month Ceramic Sealant for hydrophobic properties and protection against the elements',
    ],
  },
  {
    id: 'glass_ceramic_coating',
    name: 'Glass Ceramic Coating (12 Months)',
    price: '$100',
    details: [
      'Glass Cleaning & Polishing',
      '12-Month Ceramic Coating for hydrophobic properties & protection against the elements',
    ],
  },
  {
    id: 'pet_hair_removal',
    name: 'Pet Hair Removal',
    price: '$80',
    details: ['Remove all the fluff!'],
  },
  {
    id: 'engine_bay_detailing',
    name: 'Engine Bay Detailing',
    price: '$120',
    details: ['Have your engine breathe clean air!'],
  }
];

export default function AddOnsScreen({ route }) {
  
  const navigation = useNavigation();
  const { selectedPackage } = route?.params || {}; // Handle case where params may not be provided
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  

  const toggleAddOn = (id) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const proceedToCheckout = () => {
    navigation.navigate('Checkout', {
      selectedPackage,
      selectedAddOns,
    });
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Our Services</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Add-Ons</Text>
      </View>
  
      <ScrollView style={styles.scrollView}>
        {addOns.map((addon) => (
          <TouchableOpacity
            key={addon.id}
            style={styles.addonItem}
            onPress={() => toggleAddOn(addon.id)}
          >
            <View style={styles.addonHeader}>
              <MaterialCommunityIcons
                name={selectedAddOns.includes(addon.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color="#000000"
              />
              <Text style={styles.addonName}>{addon.name}</Text>
              <Text style={styles.addonPrice}>{addon.price}</Text>
            </View>
            <View style={styles.addonDetails}>
              {addon.details.map((detail, index) => (
                <Text key={index} style={styles.detailText}>• {detail}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
  
      <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
        <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backLink: {
    fontSize: 18,
    color: '#007AFF',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  addonItem: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 12,
    height: 12,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: 'black',
  },
  addonName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  addonPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  addonDetails: {
    paddingLeft: 36,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  checkoutButton: {
    backgroundColor: 'black',
    borderRadius: 30,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
