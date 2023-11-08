import React, { Component } from "react";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from "./screens/home";

const StackNavigator = () => {

    const Stack = createNativeStackNavigator()
    return (
        <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} options={{headerShown:false}}/>
            
        </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigator;
