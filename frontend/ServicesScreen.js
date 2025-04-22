// frontend/ServicesScreen.js

"use client";

import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert, StatusBar,
  Platform, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVICE_AREAS = [
  "New York","Los Angeles","Chicago","Houston","Phoenix",
  "Philadelphia","San Antonio","San Diego","Dallas","San Jose"
];

const INTERIOR_SERVICES = [
  { id:"mini-interior", title:"Mini Interior Detail", price:"$109", features:[
    "Vacuuming of the entire interior surfaces",
    "Thorough wipe down of all surfaces & crevices",
    "Cleaning of all window & mirrors",
  ]},
  { id:"full-interior", title:"Full Interior Detail", price:"$189", recommended:true, features:[
    "Intensive complete vacuuming of the entire interior",
    "Thorough wipe down & sanitization of all surfaces & crevices",
    "Deep steam shampooing of all carpets, seats, & mats",
    "Premium leather seats conditioning treatment",
    "Streak-free cleaning of all window & mirrors",
    "Vinyl polish finishing for shine & protection on all interior surfaces",
  ]},
];

const EXTERIOR_SERVICES = [
  { id:"mini-exterior", title:"Mini Exterior Detail", price:"$59", features:[
    "Professional hand wash & dry of the entire exterior",
    "Streak-free cleaning of all window & mirrors",
    "Deep cleaning of the tires & rims",
    "Tire dressing treatment for enhanced shine",
    "High-gloss, hydrophobic wax coating application on the paint",
  ]},
  { id:"full-exterior", title:"Full Exterior Detail", price:"$159", recommended:true, features:[
    "Professional hand wash & dry of the entire exterior",
    "Streak-free cleaning of all window & mirrors",
    "Deep cleaning of the tires & rims",
    "Tire dressing treatment for enhanced shine",
    "One year ceramic sealant",
  ]},
];

const CERAMIC_PACKAGES = [
  { id:"sapphire", title:"Sapphire Ceramic Coating", price:"$599", duration:"3 Years Protection", features:[
    "Professional hand wash & dry of the entire exterior",
    "Streak-free cleaning of all window & mirrors",
    "Deep cleaning of the tires & rims",
    "Tire dressing treatment for enhanced shine",
    "Clay bar treatment","1 step polish","Applying 3 years ceramic coating",
  ]},
  { id:"emerald",  title:"Emerald Ceramic Coating",  price:"$799", duration:"5 Years Protection", recommended:true, features:[
    "Professional hand wash & dry of the entire exterior",
    "Streak-free cleaning of all window & mirrors",
    "Deep cleaning of the tires & rims",
    "Tire dressing treatment for enhanced shine",
    "Clay bar treatment","1 step polish","Applying 5 years ceramic coating",
  ]},
  { id:"diamond",  title:"Diamond Ceramic Coating",  price:"$999", duration:"9 Years Protection", features:[
    "Professional hand wash & dry of the entire exterior",
    "Streak-free cleaning of all window & mirrors",
    "Deep cleaning of the tires & rims",
    "Tire dressing treatment for enhanced shine",
    "Clay bar treatment","1 step polish","Applying 9 years ceramic coating",
  ]},
];

const ADDONS = [
  { id:"pet-hair",    title:"Pet Hair Removal",     price:"$29" },
  { id:"7-seater",    title:"7 Seaters Interior",   price:"$19 extra" },
  { id:"glass-ceramic", title:"Glass Ceramic Coating", price:"$169" },
  { id:"odor-removal", title:"Odor Removal",         price:"$89" },
];

const { width: screenWidth } = Dimensions.get("window");

export default function ServicesScreen({ navigation }) {
  const [locationVerified, setLocationVerified] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [activeTab, setActiveTab] = useState("interior");
  const [selectedServices, setSelectedServices] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name:"", email:"", phone:"", date:"", time:"", address:"", notes:""
  });

  useEffect(() => { checkLocationPermission() }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status==="granted") getLocationAndVerify();
      else setLocationError("Location permission denied. Please enter your zip code manually.");
    } catch {
      setLocationError("Error accessing location services. Enter zip code manually.");
    }
  };

  const getLocationAndVerify = async () => {
    setCheckingLocation(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      if (geocode.length>0 && SERVICE_AREAS.includes(geocode[0].city)) {
        setLocationVerified(true);
        setLocationModalVisible(false);
        Alert.alert("Service Available", `We provide service in ${geocode[0].city}.`);
      } else {
        setLocationError(`Sorry, we don't currently provide service in ${geocode[0].city}.`);
      }
    } catch {
      setLocationError("Error determining your location. Enter zip code manually.");
    } finally { setCheckingLocation(false) }
  };

  const verifyZipCode = async () => {
    if (!zipCode||zipCode.length<5) return Alert.alert("Invalid Zip Code","Please enter a valid zip code.");
    setCheckingLocation(true);
    setTimeout(() => {
      setLocationVerified(true);
      setLocationModalVisible(false);
      Alert.alert("Service Available","We provide service in your area.");
      setCheckingLocation(false);
    },1500);
  };

  const toggleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      const next = {...prev};
      if (next[serviceId]) delete next[serviceId];
      else next[serviceId] = true;
      return next;
    });
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id=>id!==addonId)
        : [...prev,addonId]
    );
  };

  const handleInputChange = (field, value) => {
    setBookingForm(prev=>({...prev, [field]:value}));
  };

  const submitBooking = async () => {
    const { name, email, phone, date, time, address } = bookingForm;
    if (!name||!email||!phone||!date||!time||!address) {
      return Alert.alert("Missing Information","Please fill in all required fields.");
    }
    if (Object.keys(selectedServices).length===0) {
      return Alert.alert("No Service Selected","Please select at least one service.");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const [serviceId] = Object.keys(selectedServices);
      let serviceType="CORE";
      if (serviceId==="full-interior") serviceType="PRO";
      if (serviceId==="sapphire")        serviceType="SAPPHIRE";
      if (serviceId==="emerald")         serviceType="EMERALD";
      const [timePart, mod] = time.split(" ");
      let [h,m] = timePart.split(":").map(Number);
      if (mod==="PM"&&h<12) h+=12;
      if (mod==="AM"&&h===12) h=0;
      const startTime=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      const endTime = startTime;

      await axios.post(
        "http://localhost:5001/bookings",
        { service:serviceType, appointmentDate:date, startTime, endTime },
        { headers:{ Authorization:`Bearer ${token}` } }
      );

      Alert.alert(
        "Booking Pending",
        "Your booking is pending approval. You’ll be notified once the admin responds.",
        [{ text:"OK", onPress:()=>setBookingModalVisible(false) }]
      );
      setBookingForm({ name:"",email:"",phone:"",date:"",time:"",address:"",notes:"" });
      setSelectedServices({});
      setSelectedAddons([]);
    } catch(err) {
      console.error(err);
      Alert.alert("Error","Could not submit booking. "+(err.response?.data?.message||""));
    }
  };

  const calculateTotal = () => {
    let total=0;
    INTERIOR_SERVICES.forEach(s=> selectedServices[s.id]&& (total+=parseInt(s.price.replace("$",""))));
    EXTERIOR_SERVICES.forEach(s=> selectedServices[s.id]&& (total+=parseInt(s.price.replace("$",""))));
    CERAMIC_PACKAGES.forEach(p=> selectedServices[p.id]&& (total+=parseInt(p.price.replace("$",""))));
    ADDONS.forEach(a=> selectedAddons.includes(a.id)&& (a.id==="7-seater"? total+=19 : total+=parseInt(a.price.replace("$",""))));
    return total;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <TouchableOpacity style={styles.adminButton} onPress={()=>navigation.navigate("AdminBookings")}>
          <Ionicons name="settings-outline" size={24} color="#000"/>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {["interior","exterior","ceramic","addons"].map(tab=>(
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab===tab&&styles.activeTab]}
            onPress={()=>setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab===tab&&styles.activeTabText]}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab==="interior"&&(
          <View>
            <Text style={styles.sectionTitle}>Interior Detailing Services</Text>
            <Text style={styles.sectionDescription}>
              Our interior detailing services restore and protect your vehicle's cabin.
            </Text>
            {INTERIOR_SERVICES.map(s=>(
              <TouchableOpacity
                key={s.id}
                style={[styles.serviceCard, selectedServices[s.id]&&styles.selectedServiceCard]}
                onPress={()=>toggleServiceSelection(s.id)}
                activeOpacity={0.7}
              >
                {s.recommended&&(
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                <View style={styles.serviceCardHeader}>
                  <Text style={styles.serviceCardTitle}>{s.title}</Text>
                  <Text style={styles.serviceCardPrice}>{s.price}</Text>
                </View>
                <View style={styles.divider}/>
                {s.features.map((f,i)=>(
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#000" style={styles.featureIcon}/>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab==="exterior"&&(
          <View>
            <Text style={styles.sectionTitle}>Exterior Detailing Services</Text>
            <Text style={styles.sectionDescription}>
              Our exterior services remove contaminants, restore shine, and protect your vehicle's paint.
            </Text>
            {EXTERIOR_SERVICES.map(s=>(
              <TouchableOpacity
                key={s.id}
                style={[styles.serviceCard, selectedServices[s.id]&&styles.selectedServiceCard]}
                onPress={()=>toggleServiceSelection(s.id)}
                activeOpacity={0.7}
              >
                {s.recommended&&(
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                <View style={styles.serviceCardHeader}>
                  <Text style={styles.serviceCardTitle}>{s.title}</Text>
                  <Text style={styles.serviceCardPrice}>{s.price}</Text>
                </View>
                <View style={styles.divider}/>
                {s.features.map((f,i)=>(
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#000" style={styles.featureIcon}/>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab==="ceramic"&&(
          <View>
            <Text style={styles.sectionTitle}>Ceramic Coating Packages</Text>
            <Text style={styles.sectionDescription}>
              Ceramic coatings provide superior protection for your vehicle's paint.
            </Text>
            {CERAMIC_PACKAGES.map(p=>(
              <TouchableOpacity
                key={p.id}
                style={[styles.serviceCard, selectedServices[p.id]&&styles.selectedServiceCard]}
                onPress={()=>toggleServiceSelection(p.id)}
                activeOpacity={0.7}
              >
                {p.recommended&&(
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                <View style={styles.serviceCardHeader}>
                  <Text style={styles.serviceCardTitle}>{p.title}</Text>
                  <Text style={styles.serviceDuration}>{p.duration}</Text>
                  <Text style={styles.serviceCardPrice}>{p.price}</Text>
                </View>
                <View style={styles.divider}/>
                {p.features.map((f,i)=>(
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#000" style={styles.featureIcon}/>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab==="addons"&&(
          <View>
            <Text style={styles.sectionTitle}>Service Add‑ons</Text>
            <Text style={styles.sectionDescription}>
              Enhance your detail with these additional options.
            </Text>
            {ADDONS.map(a=>(
              <TouchableOpacity
                key={a.id}
                style={[styles.addonCard, selectedAddons.includes(a.id)&&styles.selectedAddonCard]}
                onPress={()=>toggleAddon(a.id)}
                activeOpacity={0.7}
              >
                <View style={styles.addonInfo}>
                  <Text style={styles.addonTitle}>{a.title}</Text>
                  <Text style={styles.addonPrice}>{a.price}</Text>
                </View>
                {selectedAddons.includes(a.id)&&(
                  <Ionicons name="checkmark" size={16} color="#000"/>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.spacer}/>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${calculateTotal()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, Object.keys(selectedServices).length===0&&styles.bookButtonDisabled]}
          onPress={()=>setBookingModalVisible(true)}
          disabled={Object.keys(selectedServices).length===0}
        >
          <Text style={styles.bookButtonText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={()=>setBookingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Your Booking</Text>
              <TouchableOpacity onPress={()=>setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000"/>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formContainer}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={bookingForm.name}
                onChangeText={t=>handleInputChange("name",t)}
              />
              <Text style={styles.formLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                value={bookingForm.email}
                onChangeText={t=>handleInputChange("email",t)}
              />
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={bookingForm.phone}
                onChangeText={t=>handleInputChange("phone",t)}
              />
              <Text style={styles.formLabel}>Preferred Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                value={bookingForm.date}
                onChangeText={t=>handleInputChange("date",t)}
              />
              <Text style={styles.formLabel}>Preferred Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM AM/PM"
                value={bookingForm.time}
                onChangeText={t=>handleInputChange("time",t)}
              />
              <Text style={styles.formLabel}>Service Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                value={bookingForm.address}
                onChangeText={t=>handleInputChange("address",t)}
              />
              <Text style={styles.formLabel}>Additional Notes</Text>
              <TextInput
                style={[styles.input,styles.textArea]}
                placeholder="Any special instructions"
                multiline
                numberOfLines={4}
                value={bookingForm.notes}
                onChangeText={t=>handleInputChange("notes",t)}
              />

              <TouchableOpacity style={styles.submitButton} onPress={submitBooking}>
                <Text style={styles.submitButtonText}>SUBMIT BOOKING</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff" },
  header:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:20, paddingTop:Platform.OS==="android"?40:20 },
  headerTitle:{ fontSize:20, fontWeight:"600", color:"#000" },
  adminButton:{ padding:8 },
  tabContainer:{ flexDirection:"row", borderBottomWidth:1, borderBottomColor:"#eee" },
  tab:{ flex:1, alignItems:"center", paddingVertical:12 },
  activeTab:{ borderBottomWidth:2, borderBottomColor:"#000" },
  tabText:{ fontSize:14, color:"#888" },
  activeTabText:{ color:"#000", fontWeight:"600" },
  content:{ flex:1, padding:20 },
  sectionTitle:{ fontSize:18, fontWeight:"600", marginBottom:8 },
  sectionDescription:{ fontSize:14, color:"#666", marginBottom:20 },
  serviceCard:{ backgroundColor:"#fff", borderRadius:12, padding:20, marginBottom:16, borderWidth:1, borderColor:"#eee" },
  selectedServiceCard:{ borderColor:"#000", borderWidth:2 },
  recommendedBadge:{ position:"absolute", top:-10, right:20, backgroundColor:"#000", padding:5, borderRadius:20 },
  recommendedText:{ color:"#fff", fontSize:10 },
  serviceCardHeader:{ flexDirection:"row", justifyContent:"space-between", marginBottom:10 },
  serviceCardTitle:{ fontSize:16, fontWeight:"600" },
  serviceCardPrice:{ fontSize:18, fontWeight:"700" },
  serviceDuration:{ fontSize:14, color:"#666", marginBottom:10 },
  divider:{ height:1, backgroundColor:"#eee", marginVertical:10 },
  featureRow:{ flexDirection:"row", marginBottom:8 },
  featureIcon:{ marginRight:8, marginTop:2 },
  featureText:{ flex:1 },
  addonCard:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", backgroundColor:"#fff", borderRadius:12, padding:16, marginBottom:12, borderWidth:1, borderColor:"#eee" },
  selectedAddonCard:{ borderColor:"#000", borderWidth:2 },
  addonInfo:{ flex:1 },
  addonTitle:{ fontSize:16, fontWeight:"500" },
  addonPrice:{ fontSize:14, color:"#666" },
  spacer:{ height:40 },
  footer:{ flexDirection:"row", padding:16, borderTopWidth:1, borderTopColor:"#eee", backgroundColor:"#fff" },
  summaryContainer:{ flex:1 },
  totalLabel:{ fontSize:14, color:"#666" },
  totalPrice:{ fontSize:20, fontWeight:"700" },
  bookButton:{ backgroundColor:"#000", padding:14, borderRadius:30 },
  bookButtonDisabled:{ backgroundColor:"#999" },
  bookButtonText:{ color:"#fff", fontWeight:"600" },
  modalContainer:{ flex:1, backgroundColor:"rgba(0,0,0,0.5)", justifyContent:"flex-end" },
  modalContent:{ backgroundColor:"#fff", borderTopLeftRadius:20, borderTopRightRadius:20, height:"90%" },
  modalHeader:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:20, borderBottomWidth:1, borderBottomColor:"#eee" },
  modalTitle:{ fontSize:18, fontWeight:"600" },
  formContainer:{ padding:20 },
  formLabel:{ fontSize:14, fontWeight:"500", marginBottom:8 },
  input:{ borderWidth:1, borderColor:"#eee", borderRadius:8, padding:12, marginBottom:16 },
  textArea:{ height:100, textAlignVertical:"top" },
  submitButton:{ backgroundColor:"#000", padding:16, borderRadius:30, alignItems:"center", marginTop:20 },
  submitButtonText:{ color:"#fff", fontSize:16, fontWeight:"600" },
});