import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, Alert, Platform, PermissionsAndroid, Pressable, NativeEventEmitter, NativeModules, FlatList, TouchableHighlight, View } from 'react-native';
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'

import { isLocationEnabled, promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { Colors } from 'react-native/Libraries/NewAppScreen';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const App2 = () => {

    const [devices, setDevices] = useState({
        id: "",
        ch: "",
        service: "",
        isConnected: false,
    });
    const [peripherals, setPeripherals] = useState(
        new Map<Peripheral['id'], Peripheral>(),
    );



    // console.debug('peripherals map updated', [...peripherals.entries()]);



    useEffect(() => {
        BleManager.start({ showAlert: false });

        const ble1 = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

        const ble2 = bleManagerEmitter.addListener(
            'BleManagerStopScan',
            handleStopScan
        );

        const ble3 = bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            handleDisconnectedPeripheral
        )

        handlePermission();
        console.log(Platform.Version);


        return () => {
            ble1.remove();
            ble2.remove();
            ble3.remove();
        }

    }, []);

    const handleStopScan = () => {
        console.log("Scanning stoped for BLE devices.");
    }



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
    const serivce_uid: string[] = [];



    const startScan = () => {
        console.log(BleManager.checkState().then((state) => {
            console.log(state);
        }))
        setPeripherals(new Map<Peripheral['id'], Peripheral>());
        try {
            console.log("Scanning started");
            BleManager.scan(serivce_uid, 10, true, { matchMode: BleScanMatchMode.Sticky, scanMode: BleScanMode.LowLatency, callbackType: BleScanCallbackType.AllMatches })
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

    const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
        // console.log("Adding the peripherals.")
        setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
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
            if (peripheral.name == 'ALOK') {
                await BleManager.stopScan();
                await connect(peripheral);
            }
            // console.log("Peripherals" + peripheral.name);
            addOrUpdatePeripheral(peripheral.id, peripheral);
        }
    }

    function sleep(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    const getConnected = async () => {
        try {
            const devices = await BleManager.getConnectedPeripherals();
            console.log("In retrieve function ", devices);
        }
        catch (err) {
            console.log("Unable to get the connected devices..")
        }


    }

    const handleDisconnectedPeripheral = (
        event: BleDisconnectPeripheralEvent,
    ) => {
        let peripheral = peripherals.get(event.peripheral);
        if (peripheral) {
            console.debug(
                `[handleDisconnectedPeripheral][${peripheral.id}] previously connected peripheral is disconnected.`,
                event.peripheral,
            );
        }
        console.debug(
            `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`,
            // connect();
            setDevices((state) => ({ ...state, ch: "", id: "", service: "", isConnected: false }))
        );
    };

    const connect = async (peripheral: Peripheral) => {
        try {
            if (peripheral) {
                await BleManager.connect(peripheral.id);
                console.log('pheripheral connected.');

                await sleep(900);

                const data = await BleManager.retrieveServices(peripheral.id);
                console.log("services: ", data);

                const rssi = await BleManager.readRSSI(peripheral.id);

                console.log("Rssi : " + rssi);

                if (data.characteristics) {
                    console.log("Present");
                }

                getConnected();

                if (data.characteristics) {
                    for (let characteristic of data.characteristics) {
                        if (characteristic.descriptors) {
                            for (let descriptor of characteristic.descriptors) {
                                try {
                                    let data = await BleManager.readDescriptor(
                                        peripheral.id,
                                        characteristic.service, characteristic.characteristic,
                                        descriptor.uuid
                                    );
                                    console.log("per", peripheral.id, " read as", data);
                                    setDevices((state) => ({ ...state, id: peripheral.id, ch: characteristic.characteristic, service: characteristic.service, isConnected: true }));

                                }
                                catch (err) {
                                    console.log("Don't able to get the data");
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log("Error occur..." + err);
        }
    }

    const senddata = (num: Number) => {
        const { id, service, ch } = devices;
        console.log(id + " " + service + " " + ch);
        // [0x74, 0xc3, 0xa9, 0x73, 0x74] ==> 1
        var data: number[] = [];
        switch (num) {
            case 1:
                data = [0x74, 0xc3, 0xa9, 0x73, 0x74];
                break;

            case 2:
                data = [0x60, 0xc3, 0x99, 0x09];
                break;

            case 3:
                data = [0, 0, 0, 0];
                break;

            case 4:
                data = [124, 18, 205, 41, 76];
                break;
            case 5:
                data = [0x60, 0xc3, 0x99, 0x09];
                break;
            case 6:
                data = [0x60, 0xc3, 0x99, 0x09];
                break;
            case 7:
                data = [0x60, 0xc3, 0x99, 0x09];
                break;

            case 8:
                data = [124, 18, 205, 41, 76];
                break;

            default:
                break;
        }

        BleManager.write(id, service, ch, data)
            .then(() => {
                console.log("Data sended");
            })
            .catch(() => {
                "error";
            })
    }

    const disconnect = () => {
        const { id } = devices;

        BleManager.disconnect(id).then((val) => {
            console.log("Disconnected");
        })
            .catch((err) => {
                console.log(err);
            })
    }


    return (
        <>


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



            {
                (devices.isConnected === false) ?
                    <FlatList
                        data={Array.from(peripherals.values())}
                        contentContainerStyle={{ rowGap: 12 }}
                        keyExtractor={item => item.id}
                        renderItem={item => (
                            <TouchableHighlight
                                underlayColor="#0082FC"
                                onPress={() => connect(item.item)}>
                                <View >
                                    <Text>
                                        {item.item.name} - {item.item.advertising?.localName}
                                    </Text>

                                    <Text>RSSI: {item.item.rssi}</Text>
                                    <Text>{item.item.id}</Text>
                                </View>
                            </TouchableHighlight>
                        )}
                    /> : null
            }

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <TouchableHighlight onPress={(e) => { senddata(1) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>1</Text></TouchableHighlight>
                <TouchableHighlight onPress={(e) => { senddata(2) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>2</Text></TouchableHighlight>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <TouchableHighlight onPress={(e) => { senddata(3) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>3</Text></TouchableHighlight>
                <TouchableHighlight onPress={(e) => { senddata(4) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>4</Text></TouchableHighlight>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <TouchableHighlight onPress={(e) => { senddata(5) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>3</Text></TouchableHighlight>
                <TouchableHighlight onPress={(e) => { senddata(6) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>4</Text></TouchableHighlight>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <TouchableHighlight onPress={(e) => { senddata(7) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>3</Text></TouchableHighlight>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <TouchableHighlight onPress={(e) => { senddata(8) }} style={{ width: 140, margin: 10, padding: 20, backgroundColor: "lightblue", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text style={{ fontSize: 15 }}>Scan</Text></TouchableHighlight>
            </View>



            {

                (devices.isConnected) ?
                    <TouchableHighlight onPress={disconnect} style={{ margin: 30, padding: 20, backgroundColor: "red", alignItems: 'center', borderBlockColor: 'black', borderRadius: 40, }}><Text>Disconnect</Text></TouchableHighlight>
                    : null
            }
        </>
    )
};


export default App2;