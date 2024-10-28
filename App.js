import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Image, Button} from 'react-native';



export default function App() {
  return (
    <SafeAreaView style={styles.container}> 
      {/* Image of Shelby Auto Detailing Logo*/}
        <Image 
        source = {require("./assets/shelbylogo.png")} 
        style = {styles.header}> 
        </Image>

    {/* Top Buttons*/}
      <View style ={styles.buttonContainer}> 
          <Button title = "Detailing Services" color = "black" onPress ={() => {}}></Button>
          <Button title = "Home Services" color = "black" onPress ={() => {}}></Button>
      </View>

    {/*Image of car interior*/}
      <Image 
      source = {require("./assets/shelapppic.png")}
      style = {styles.image} >
      </Image>

    <View style = {styles.spacer}/>
    {/* Bottom Buttons*/}
      <View style={styles.bottomButtonContainer}>
        <Button title="Contact" color="black" onPress={() => {}} />
        <Button title="Account" color="black" onPress={() => {}} />
        <Button title="Settings" color="black" onPress={() => {}} />
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start', //align items at the top
  },
  image: { //for car image in center
    width: 400,
    height: 400,
    resizeMode: 'cover',
    marginTop: 10,
  },
  header: { //for Shelby logo
    position: 'absolute', //position the logo absolutely
    top: 20,  //aligns it to the top of the screen
    resizeMode: 'contain', //ensures the image is scaled properly
    width: 200, 
    height: 130,
  },
  buttonContainer: {
    marginTop: 100,
    flexDirection: 'row',
    width: '80%',
    //backgroundColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'space-around',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 10,
  },
  spacer: {
    flex: 1
  }
});
