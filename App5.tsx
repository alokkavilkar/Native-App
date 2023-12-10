import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import Home from './Home';
import Details from './Details';

const FirstTimePage = ({navigation} : {navigation:any}) => {
    const [isFirstTime, setIsFirstTime] = useState(true);

    useEffect(() => {
        checkIfFirstTime();
    }, []);

    const checkIfFirstTime = async () => {
        try {
            const value = await AsyncStorage.getItem('@app:isFirstTime');
            console.log(value);
            if (value !== null && value === 'false') {
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
            <Home navigation={navigation}/>
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
          
          <Details route={params} navigation={undefined} />


        )// Or any other component or null if no content should be rendered
    }
};

export default FirstTimePage;
