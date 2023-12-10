import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Button, NativeEventEmitter, NativeModules, Text, ToastAndroid, View } from "react-native";
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const Details = ({ route, navigation }: { route: any, navigation: any }) => {

    var s = "";

    const val = AsyncStorage.getItem("@app:device");
    val.then((val) => {
        console.log(val);
        s += val;
    })


    useEffect(() => {
        connect(s);
        const getStoredDeviceID = async () => {
            try {
                const storedDeviceID = await AsyncStorage.getItem("@app:device");
                if (storedDeviceID) {
                    // setDeviceID(storedDeviceID);
                    // connect(storedDeviceID); // Connect with the retrieved device ID
                    const isConnected = await BleManager.isPeripheralConnected(storedDeviceID);
                    console.log(isConnected);

                    if (!isConnected) {
                        connect(storedDeviceID);
                    }
                }
            } catch (error) {
                console.error("Error retrieving device ID from AsyncStorage:", error);
            }
        };


        getStoredDeviceID();
        console.log("In useeffect");

        const ble3 = bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            handleDisconnectedPeripheral
        )



        return (() => {
            ble3.remove();
        })
    }, []);

    const handleDisconnectedPeripheral = (
        event: BleDisconnectPeripheralEvent,
    ) => {

        console.debug(
            `[handleDisconnectedPeripheral][] previously connected peripheral is disconnected.`,
            event.peripheral,
        );

        console.debug(
            `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`,
            // connect();
        );
    };

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

    const disconnect = (peripheral: string) => {

        BleManager.disconnect(peripheral).then((val) => {
            console.log("Disconnected");
            ToastAndroid.show("Disconnected... Ready to Pair.", ToastAndroid.SHORT);
        })
            .catch((err) => {
                console.log(err);
            })
    }

    const connect = async (peripheral: string) => {
        try {
            if (peripheral) {
                await BleManager.connect(peripheral);
                console.log('pheripheral connected.');
                ToastAndroid.show("Connected", ToastAndroid.SHORT);
                await sleep(900);

                const data = await BleManager.retrieveServices(peripheral);
                console.log("services: ", data);

                const rssi = await BleManager.readRSSI(peripheral);

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
                                        peripheral,
                                        characteristic.service, characteristic.characteristic,
                                        descriptor.uuid
                                    );
                                    console.log("per", peripheral, " read as", data);
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
            ToastAndroid.show("Disconnected check bluetooth connection", ToastAndroid.SHORT);
            console.log("Error occur..." + err);
        }
    }

    const senddata = (num: Number) => {

        var data: number[] = [];
        switch (num) {
            case 1:
                data = [1];
                break;

            case 2:
                data = [2];
                break;

            case 3:
                data = [3];
                break;

            case 4:
                data = [4];
                break;
            case 5:
                data = [5];
                break;
            case 6:
                data = [6];
                break;
            case 7:
                data = [7];
                break;

            case 8:
                data = [8];
                break;

            case 9:
                data = [9];
                break;

            default:
                break;
        }

        BleManager.write(s, "ffe0", "ffe1", data)
            .then(() => {
                console.log("Data sended");
            })
            .catch((err) => {
                console.log("Error: ", err);
            })
    }



    return (
        <View style={{ margin: 10 }}>
            <Text> Details Page.</Text>
            {/* <Text>{data["advertising"]["localName"]}</Text> */}

            <View style={{ margin: 10 }}>
                <Button title="connect"
                    onPress={() => connect(s)}
                />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: "space-between",padding:10}}>
                <View style={{ width: 150 }}>
                    <Button title="1" onPress={()=>senddata(1)} />
                </View>
                <View style={{ width: 150 }}>
                    <Button title="2" onPress={()=>senddata(2)} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: "space-between",padding:10}}>
                <View style={{ width: 150 }}>
                    <Button title="3" onPress={()=>senddata(3)} />
                </View>
                <View style={{ width: 150 }}>
                    <Button title="4" onPress={()=>senddata(4)}/>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: "space-between",padding:10}}>
                <View style={{ width: 150 }}>
                    <Button title="5" onPress={()=>senddata(5)} />
                </View>
                <View style={{ width: 150 }}>
                    <Button title="6" onPress={()=>senddata(6)} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: "space-between",padding:10}}>
                <View style={{ width: 150 }}>
                    <Button title="7" onPress={()=>senddata(7)}/>
                </View>
                <View style={{ width: 150 }}>
                    <Button title="Scan" onPress={()=>senddata(8)} />
                </View>
            </View>
            <View style={{padding:10}}>
                <View >
                    <Button title="Mute" onPress={()=>senddata(9)} />
                </View>
            </View>
            
            
            <Button title="diconnect" color="#FF0000"
                onPress={() => disconnect(s)}
            />
        </View>
    )
}

export default Details;