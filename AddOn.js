import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const addOns = [
  {
    id: 'exterior_detail',
    name: 'Exterior Detail',
    description: [
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
    description: [
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
    description: [
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
  },
  {
    id: 'engine_bay_detailing',
    name: 'Engine Bay Detailing',
    description: ['Have your engine breathe clean air!'],
    price: '$120',
  },
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Select Add-Ons</Text>
        {addOns.map((addOn) => (
          <TouchableOpacity
            key={addOn.id}
            onPress={() => toggleAddOn(addOn.id)}
            style={styles.addOnItem}
          >
            <View style={styles.addOnHeader}>
              <MaterialCommunityIcons
                name={
                  selectedAddOns.includes(addOn.id)
                    ? 'checkbox-marked'
                    : 'checkbox-blank-outline'
                }
                size={24}
                color="#000000"
              />
              <Text style={styles.addOnTitle}>{addOn.name}</Text>
              <Text style={styles.addOnPrice}>{addOn.price}</Text>
            </View>
            <View style={styles.addOnDescription}>
              {addOn.description.map((item, index) => (
                <Text key={index} style={styles.descriptionItem}>
                  • {item}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.proceedButton} onPress={proceedToCheckout}>
          <Text style={styles.proceedButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F2F2F2',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  addOnItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addOnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addOnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginLeft: 10,
  },
  addOnPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addOnDescription: {
    paddingLeft: 34,
  },
  descriptionItem: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 5,
  },
  proceedButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
