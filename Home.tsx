import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, PermissionsAndroid, Platform, Pressable, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
import { NativeEventEmitter, NativeModules } from "react-native";
import { isLocationEnabled, promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const Home = ({ navigation }: { navigation: any }) => {
    const [peripherals, setPeripherals] = useState(
        new Map<Peripheral['id'], Peripheral>(),
    );
    const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
        // console.log("Adding the peripherals.")
        setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
    }


    useEffect(() => {
        BleManager.start({ showAlert: false });

        const ble1 = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

        handlePermission();
        console.log(Platform.Version);


        return () => {
            ble1.remove();
        }

    }, []);


    const enableBLE = async () => {
        console.log("Ble is starting the connection.");
        try {
            await BleManager.enableBluetooth();
            console.log("Bluetooth enabled");
            const checkEnabled: boolean = await isLocationEnabled();
            console.log("checkEnabled" + checkEnabled);
            if (checkEnabled === false) {
                await promptForEnableLocationIfNeeded().then((val) => {
                    console.log("Location enabled.");
                })
                    .catch((err) => {
                        console.log("Failed to to so...." + err);
                    })
            }
        }
        catch (error) {
            console.log("Error enabling bluetotth");
            Alert.alert(
                'Bluetooth permission required',
                'Please enable Bluetooth permission',
                [{ text: "Ok", onPress: () => console.log("Ok Pressed") }]
            )
        }

    }
    const startScan = () => {
        console.log(BleManager.checkState().then((state) => {
            console.log(state);
        }))
        setPeripherals(new Map<Peripheral['id'], Peripheral>());
        try {
            console.log("Scanning started");
            BleManager.scan([], 10, true, { matchMode: BleScanMatchMode.Sticky, scanMode: BleScanMode.LowLatency, callbackType: BleScanCallbackType.AllMatches })
                .then(() => {
                    console.log("Scanning succesfull");
                    // console.log(serivce_uid);
                })
                .catch((err) => {
                    console.log("Got erro while scanning.." + err);
                })
        }
        catch (error) {
            console.log("Scanning cannot be performed..." + error);
        }
    }
    const handleDiscoverPeripheral = async (peripheral: Peripheral) => {
        console.debug('[handleDiscoverPeripheral] new BLE peripheral= ', peripheral.name);

        if (!peripheral) {
            console.log("Please check with the location");
        }

        if (!peripheral.name) {
            peripheral.name = 'No Name';
        }
        else {
            // console.log("Peripherals" + peripheral.name);
            addOrUpdatePeripheral(peripheral.id, peripheral);
        }
    }

    const handlePermission = () => {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]
            )
                .then(val => {
                    if (val) {
                        console.debug("Permission for android 12+ accepted.");
                    } else {
                        console.log("Permission denied by the user.");
                    }
                })
        }
        else if (Platform.OS == 'android' && Platform.Version >= 23) {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,)
                .then((val) => {
                    if (val) {
                        console.log("User accepted permission");
                        // console.log(BleManager);
                    }
                    else {
                        console.log("user denied the permission");
                    }
                })
        }

    }

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        
            <TouchableOpacity
                style={{ margin: 10, padding: 20, backgroundColor: "lightblue" }}
                onPress={enableBLE}
            >
                <Text style={{ fontWeight: '400' }}>click to start bleuttoth</Text>
            </TouchableOpacity>

            <Pressable style={{ margin: 10, padding: 20, alignItems: 'center', backgroundColor: 'grey' }} onPress={startScan}>
                <Text>
                    Scan Bluetooth
                </Text>
            </Pressable>
            <FlatList
                data={Array.from(peripherals.values())}
                contentContainerStyle={{ rowGap: 12 }}
                keyExtractor={item => item.id}
                renderItem={item => (
                    <TouchableHighlight
                        underlayColor="#0082FC"
                        onPress={async ()=>{
                            navigation.navigate("Details", {
                            Pheripheral : item.item
                        },
                        AsyncStorage.setItem("@app:device", item.item.id).then((result)=>{
                            console.log(result + " Done 👍 ");
                        })
                        )}}>
                        <View >
                            <Text>
                                {item.item.name} - {item.item.advertising?.localName}
                            </Text>

                            <Text>RSSI: {item.item.rssi}</Text>
                            <Text>{item.item.id}</Text>
                        </View>
                    </TouchableHighlight>
                )}
            />
        </View>
    )
}

export default Home;