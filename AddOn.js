import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
    price: '$50',
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
    price: '$150',
  },
  {
    id: 'glass_ceramic_coating',
    name: 'Glass Ceramic Coating (12 Months)',
    price: '$100',
    details: [
      'Glass Cleaning & Polishing',
      '12-Month Ceramic Coating for hydrophobic properties & protection against the elements',
    ],
    price: '$100',
  },
  {
    id: 'pet_hair_removal',
    name: 'Pet Hair Removal',
    description: ['Remove all the fluff!'],
    price: '$80',
    details: ['Remove all the fluff!']
  },
  {
    id: 'engine_bay_detailing',
    name: 'Engine Bay Detailing',
    description: ['Have your engine breathe clean air!'],
    price: '$120',
    details: ['Have your engine breathe clean air!']
  }
];

export default function Component({ navigation, route }) {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const { selectedPackage } = route.params;

  const toggleAddOn = (id) => {
    setSelectedAddOns((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((addOnId) => addOnId !== id)
        : [...prevSelected, id]
    );
  };

  const proceedToCheckout = () => {
    navigation.navigate('Checkout', {
      selectedPackage,
      selectedAddOns,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Our Services</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Add-Ons</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Select Add-Ons</Text>
        {addOns.map((addon) => (
          <TouchableOpacity
            key={addon.id}
            style={styles.addonItem}
            onPress={() => toggleAddOn(addon.id)}
          >
            <View style={styles.addonHeader}>
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  selectedAddOns.includes(addon.id) && styles.checkboxChecked
                ]} />
              </View>
              <Text style={styles.addonName}>{addon.name}</Text>
              <Text style={styles.addonPrice}>{addon.price}</Text>
            </View>
            {/* Display Add-On Details */}
            <View style={styles.addonDetails}>
              {addon.details.map((detail, index) => (
                <Text key={index} style={styles.detailText}>• {detail}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => {
          console.log('Selected Add-Ons:', selectedAddOns);
        }}
      >
        <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 24,
  },
  addonItem: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addOnHeader: {
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
  addOnTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addOnPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addonDetails: {
    paddingLeft: 36,
    marginTop: 8, // Adds spacing between name and details
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4, // Adds space between each detail line
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
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
