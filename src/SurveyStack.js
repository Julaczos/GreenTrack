import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SurveyForm from './Form'; 
import SummaryScreen from './SummaryScreen';

const Stack = createStackNavigator();

function SurveyStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SurveyForm"
                component={SurveyForm}
                options={{
                    title: 'Ankieta',
                    headerStyle: { backgroundColor: '#2196F3' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <Stack.Screen
                name="Summary"
                component={SummaryScreen}
                options={{
                    title: 'Podsumowanie',
                    headerStyle: { backgroundColor: '#2196F3' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
        </Stack.Navigator>
    );
}

export default SurveyStack;
