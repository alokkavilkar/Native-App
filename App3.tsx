import React, { useEffect, useState } from 'react';
import { Alert, FlatList, PermissionsAndroid, Platform, Pressable, Text, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import {
    BleError,
    BleManager,
    Characteristic,
    Device,
} from 'react-native-ble-plx';
import { isLocationEnabled, promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import {btoa,atob} from 'react-native-quick-base64';

const bleManager = new BleManager();

const App3 = () => {

    // useEffect(() => {
    //     handlePermission();
    // },[])

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

    const [bluetooth, setBluetooth] = useState({ connected: true });
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState({id:"", connected:false});
    const [characteristic, getCharacteristics] = useState<Characteristic[]>(
        []
    )

    


    // const arr = bleManager.connectedDevices();
    // console.log(arr);

    console.log(bleManager.state());

    const enableBLE = async () => {
        console.log("Ble is starting the connection.");
        try {
            await bleManager.enable();
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

            setBluetooth((state) => ({ ...state, connected: true }));
        }
        catch (error) {
            console.log("Error enabling bluetotth");
            Alert.alert(
                'Bluetooth permission required',
                'Please enable Bluetooth permission',
                [{ text: "Ok", onPress: () => console.log("Ok Pressed") }]
            )
            setBluetooth((state) => ({ ...state, connected: false }));
        }

    }

    const startScan = () => {

        // bleManager.onDeviceDisconnected()

        bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
            if (error) {
                console.log("Error occured " + error.errorCode)

            }

            if (device) {
                console.log(device.localName);
                if (device.localName != null) {
                    setAllDevices(prevDevices => {
                        const filteredDevices = prevDevices.filter(prevDevice => prevDevice.id !== device.id);
                        return [...filteredDevices, device];
                    })
                }
            }
        })

        setTimeout(() => {
            console.log("Bluetooth device scanning stopped.");
            bleManager.stopDeviceScan();
            ToastAndroid.show("Scaning Stopped", ToastAndroid.SHORT);
        }, 10000);
    }



    const connectDevice = (device: { id: any; }) => {
        
        // bleManager.stopDeviceScan();
        bleManager.connectToDevice(device.id,{autoConnect:true}).then(async device => {
            await device.discoverAllServicesAndCharacteristics()
            .then((val)=>{
                console.log(val);
            })
            .catch((err)=>{
                console.log("Error in service fetching" + err);
            })
            
            // setDisplaText(`Device connected\n with ${device.name}`);
            // setConnectedDevice(device);
            // setDevices([]);
            let i = 0;
            device.services().then(async service => {
                for (const ser of service) {
                    ser.characteristics().then(characteristic => {
                        console.log(i);
                        i++;
                        getCharacteristics([
                        ...characteristic]);
                        console.log(characteristic);

                    })
                    .catch((err)=>{
                        console.log("Error while characteristics recvoering.")
                    })
                }

                setConnectedDevice((state)=>({...state, id:device.id, connected:true}));
            })
            .catch((err)=>{
                console.log("Err" + err);
            })

            console.log(characteristic);
            
        })
        .catch((err)=>{
            console.log(err);
        })
    };

    const disconnect = (id: string)=>{
        bleManager.cancelDeviceConnection(id)
        .then((val)=>{
            console.log("Device disconnted");
            setConnectedDevice((state)=>({...state, id:"", connected: false}))
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    

    const sendData = (num : Number)=>{
        bleManager.writeCharacteristicWithoutResponseForDevice(
            connectedDevice.id,"ffe0" ,"ffe2",
            "aGVsbG8gbWlzcyB0YXBweQ=="
        )
        .then((val)=>{
            console.log(val);
            console.log("Data is sended");
        })
        .catch((err)=>{
            console.log(err);
        })
    }



    return (
        <View>
            <TouchableOpacity
                style={{
                    margin: 10, padding: 20,
                    backgroundColor: (bluetooth.connected) ? "pink" : "red"
                }}
                onPress={enableBLE}
            >
                <Text style={{ fontWeight: '400', textAlign: 'center' }}>Enable Bluetooth </Text>
            </TouchableOpacity>

            <Pressable style={{ margin: 10, padding: 20, alignItems: 'center', backgroundColor: 'grey' }} onPress={startScan}>
                <Text>
                    Scan Bluetooth
                </Text>
            </Pressable>

            <FlatList
                data={Array.from(allDevices.values())}
                contentContainerStyle={{ rowGap: 12 }}
                keyExtractor={item => item.id}
                renderItem={item => (
                    <TouchableHighlight
                        underlayColor="#0082FC"
                        onPress={() => { connectDevice(item.item) }}>
                        <View >
                            <Text>
                                {item.item.localName}
                            </Text>
                            <Text>
                                {/* {item.item} */}
                            </Text>

                            <Text>RSSI: {item.item.rssi}</Text>
                            <Text>{item.item.id}</Text>
                        </View>
                    </TouchableHighlight>
                )}
            />

            {
                (connectedDevice.connected) ?

                <TouchableHighlight onPress={(e)=>{disconnect(connectedDevice.id)}}>
                    <Text style={{margin:10, backgroundColor:'red'}}>{connectedDevice.id}</Text>
                </TouchableHighlight>
                : null


            }

            <Pressable onPress={(e)=>sendData(1)}>
                <Text style={{padding:50}}>1</Text>
            </Pressable>

            
        </View>
    )
}

export default App3;