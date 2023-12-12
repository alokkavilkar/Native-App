import React, { useEffect } from "react";
import { Button, NativeEventEmitter, NativeModules, Pressable, Text, TouchableOpacity, View } from "react-native";
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Home";
import Details from "./Details";
import FirstTimePage from "./App5";
import { Main } from "./Main";

const Stack = createNativeStackNavigator();

const App4 = () => {

  return (
    <NavigationContainer >
      <Stack.Navigator  >
        <Stack.Screen name="Home"  component={FirstTimePage} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Scan"  options={({ navigation, route })=>({
          headerLeft: () => (
            <TouchableOpacity style={{marginRight:10}} onPress={()=>{
              navigation.navigate("Main")
            }}>
              <Text style={{textAlign:'center'}}>Back</Text>
            </TouchableOpacity>
          ),
          headerTitleAlign:'center'
        })} component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App4;