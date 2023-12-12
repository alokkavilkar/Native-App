import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import Home from './Home';
import Details from './Details';
import { Main } from './Main';

const FirstTimePage = ({navigation} : {navigation:any}) => {
    const [isFirstTime, setIsFirstTime] = useState(true);

    useEffect(() => {
        checkIfFirstTime();
    }, []);

    const checkIfFirstTime = async () => {
        try {
            const value1 = await AsyncStorage.getItem('@app:isFirstTime');
            console.log(value1);
            const value2 = await AsyncStorage.getItem('@app:device');
            console.log(value2);
            if (value1 !== null && value1 === 'false' && value2 !== null && value2 !== "null") {
                // Not the first time, so navigate away from this page
                setIsFirstTime(false);
            } else {
                await AsyncStorage.setItem('@app:isFirstTime', "false");
            }
        } catch (error) {
            console.error('Error retrieving data from AsyncStorage:', error);
        }
    };

    if (isFirstTime) {
        // Display the first time page
        return (
            <Main navigation={navigation}/>
        );
    } else {
        let value = "";
        AsyncStorage.getItem("@app:device").then((val)=>{
            if(val != null)
            {
                value = val;
            }
        })
        

        const params = {value};

        return (
          <Details route={params} navigation={navigation} />
        )
    }
};

export default FirstTimePage;
