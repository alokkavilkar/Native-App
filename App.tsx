import React, { SetStateAction, useEffect, useState } from 'react';
import { FlatList, PermissionsAndroid, Platform, SafeAreaView, StyleSheet, Text, TextBase, TouchableOpacity, View } from 'react-native';
import { BleError, BleManager, Device, Service } from 'react-native-ble-plx';


const App = () => {

  const [adapState, setAdapState] = useState({ adapterState: 'unknown' });
  const [devices, setDevices] = useState<Device[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device>();


  const bleManager = new BleManager();

  async function requestPermission() {
    if (Platform.OS == 'android') {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      bleManager.onStateChange((state) => {
        setAdapState({ adapterState: state });
      })

      if (permission == PermissionsAndroid.RESULTS.GRANTED) {
        console.log(permission);
        console.log("Welcome in persmision");
      }
    }
  }
  useEffect(() => {
    requestPermission();
  }, []);

  

  function scan() {
    console.log("Welcome2");

    setDevices([]);
    console.log("outer function" + devices.length)

    bleManager.startDeviceScan(null, {allowDuplicates: false}, async (error, device)=>{
      if(error)
      {
        bleManager.stopDeviceScan();
        // console.log(error);
        return;
      }
      console.log("Welcome");
      console.log(device?.localName, device?.name);
      if(device?.name == 'Mi Band 3')
      {
        console.log("inner function R"+devices.length)
        setDevices(prevDevices => {
          const filteredDevices = prevDevices.filter(prevDevice => prevDevice.id !== device.id);
          return [...filteredDevices, device];
        });
      }
      setTimeout(() => {
        bleManager.stopDeviceScan();
      }, 5000);
    })
  }

  const connect = (device: { id: string; })=>{
    bleManager.stopDeviceScan();

    bleManager.connectToDevice(device.id).then(async(device)=>{
      await device.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      device.services().then(async service=>{
        for(const ser of service)
        {
          ser.characteristics().then(characteristics=>{
            console.log(characteristics);
          })
        }
      })
    }).catch(()=>{console.log("Error")});

    setTimeout(() => {
      bleManager.cancelDeviceConnection(device.id);
      console.log(device.id + " disconnected");
    }, 5000);
  }

  // const disconnect = ()=>{
  //   device?.cancelConnection();
  // }

  return (
    <SafeAreaView>
      <View>
        <Text>Welcome Alok</Text>
      </View>
      <View style={styles.countContainer}>
        <Text>Alok</Text>
        <Text>{adapState.adapterState}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={scan}>
        <Text>Press Here</Text>
      </TouchableOpacity>
      <View>
        <FlatList  
        data={devices} 
        keyExtractor={item=>item.id.toString()}

        renderItem={item=>(
          <TouchableOpacity
            onPress={()=>{console.log("connection is initializing.");
            connect(item.item);
          }}
          >
            <Text style={{margin:20, fontSize:20}}>
              {item.item.name + " " + new Date().getTime()}
            </Text>
            {/* <Text>
              {device?.isConnected ? "Connected": "Not connected"}
            </Text> */}
            
          </TouchableOpacity>
        )}>

        </FlatList>
      </View>

    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  countContainer: {
    alignItems: 'center',
    padding: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
})

export default App;