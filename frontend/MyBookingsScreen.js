import { useState,useEffect,useContext } from "react";
import { View,Text,FlatList,TouchableOpacity,Alert,ActivityIndicator,RefreshControl } from "react-native";
import axios from "axios";
import { AuthContext } from "./AppNavigator";
const API_URL="http://localhost:5001";
export default function MyBookingsScreen(){
  const{socket,token,user}=useContext(AuthContext);
  const [PENDING, CONFIRMED, REJECTED] = ["pending", "confirmed", "rejected"];
  const[bookings,setBookings]=useState([]);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  useEffect(()=>{
    fetch();
    socket.on("booking:updated",b=>{
      if(b.user===user.userId||b.user===user._id){
        setBookings(bs=>bs.map(x=>x._id===b._id?b:x));
      }
    });
    return()=>{socket.off("booking:updated");};
  },[]);
  async function fetch(){
    setLoading(true);
    try{const{data}=await axios.get(`${API_URL}/api/bookings/user`,{headers:{Authorization:`Bearer ${token}`}});setBookings(data);}catch{Alert.alert("Error");}finally{setLoading(false);setRefreshing(false);}
  }
  function onRefresh(){setRefreshing(true);fetch();}
  function render({item}){
    return <View><Text>{item.date} {item.time} ({item.status})</Text></View>;
  }
  return <View>{
    loading?<ActivityIndicator/>:
    <FlatList data={bookings} renderItem={render} keyExtractor={i=>i._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}/>  
  }</View>;
}