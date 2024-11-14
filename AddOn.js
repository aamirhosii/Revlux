import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const addOns = [
  {
    id: 'exterior_detail',
    name: 'Exterior Detail',
    price: '$50',
    description: [
      'Exterior Foam Wash',
      'Exterior Contact Wash',
      'Break Dust Removal',
      'Tire & Wheel Detail',
      'Tire & Wheel Dressing',
    ]
  },
  {
    id: 'ceramic_paint_sealant',
    name: 'Ceramic Paint Sealant (12 Months)',
    price: '$150',
    description: [
      'Everything in the Exterior Detail Add-On Plus:',
      'Iron Decon',
      'Paint Decontamination (Clay Bar Treatment)',
      '12-Month Ceramic Sealant for hydrophobic properties and protection against the elements',
    ]
  },
  {
    id: 'glass_ceramic_coating',
    name: 'Glass Ceramic Coating (12 Months)',
    price: '$100',
    description: [
      'Glass Cleaning & Polishing',
      '12-Month Ceramic Coating for hydrophobic properties & protection against the elements',
    ]
  },
  {
    id: 'pet_hair_removal',
    name: 'Pet Hair Removal',
    price: '$80',
    description: ['Remove all the fluff!']
  },
  {
    id: 'engine_bay_detailing',
    name: 'Engine Bay Detailing',
    price: '$120',
    description: ['Have your engine breathe clean air!']
  }
];

export default function AddOnsScreen() {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const navigation = useNavigation();

  const toggleAddOn = (id) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Text style={styles.header}>Select Add-Ons</Text>
      {addOns.map((addOn) => (
        <View key={addOn.id} style={styles.addOnItem}>
          <TouchableOpacity
            onPress={() => toggleAddOn(addOn.id)}
            style={styles.addOnHeader}
          >
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
          </TouchableOpacity>

          {/* Display Add-On Details with Icon */}
          <View style={styles.detailsContainer}>
            {addOn.description.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#000000" />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => {
          console.log('Selected Add-Ons:', selectedAddOns);
          navigation.navigate('Checkout', { selectedAddOns });
        }}
      >
        <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  addOnItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  addOnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addOnTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
    color: '#000000',
  },
  addOnPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  detailsContainer: {
    marginTop: 10,
    paddingLeft: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  checkoutButton: {
    backgroundColor: '#000000',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
