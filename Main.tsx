import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const Main = ({ navigation }: { navigation: any }) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Pressable style={{ margin: '30%', backgroundColor: '#20c997', padding: 30, width: '60%', borderRadius: 30 }}onPress={() => { console.log("clicked screen 1"); navigation.navigate("Scan")}}
                >
                    <Text style={styles.buttonText}>Single Watch</Text>
                </Pressable>
                <Pressable style={{ backgroundColor: '#20c997', padding: 30, width: '60%', borderRadius: 30 }} onPress={()=>{console.log("Work in Progress of the Second Application.")}}>
                    <Text style={styles.buttonText}>Dual Watch</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#20c997',
        padding: 30,
        width: '60%',
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 20,
    },
});

