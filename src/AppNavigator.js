import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen'; 
import HomeScreen from './HomeScreen';
import Form from './Form';
import SurveyDetails from './SurveyDetails'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome">
                <Stack.Screen 
                    name="Welcome" 
                    component={WelcomeScreen} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ title: 'Logowanie', headerStyle: { backgroundColor: '#2196F3' }, headerTintColor: '#fff' }}
                />
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                    options={{ title: 'Ankiety', headerStyle: { backgroundColor: '#2196F3' }, headerTintColor: '#fff' }}
                />
                <Stack.Screen 
                    name="SurveyForm" 
                    component={Form} 
                    options={{ title: 'Formularz', headerStyle: { backgroundColor: '#2196F3' }, headerTintColor: '#fff' }}
                />
                <Stack.Screen 
                    name="SurveyChange" 
                    component={SurveyDetails} 
                    options={{ title: 'Szczegóły Ankiety', headerStyle: { backgroundColor: '#2196F3' }, headerTintColor: '#fff' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
