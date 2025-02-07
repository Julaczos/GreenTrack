import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WelcomeScreen from './src/WelcomeScreen'; 
import LoginScreen from './src/LoginScreen'; 
import HomeScreen from './src/HomeScreen';
import StatisticsScreen from './src/StatisticsScreen';
import RankingScreen from './src/RankingScreen';
import SettingsScreen from './src/SettingsScreen';
import SurveyForm from './src/SurveyForm'; 
import SummaryScreen from './src/SummaryScreen';
import { SurveyProvider } from './src/SurveyContext'; 
import SurveyDetails from './src/SurveyDetails';
import AddUserScreen from './src/addUserScreen';
import NotificationsScreen from './src/NotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function SurveyStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SurveyList"
                component={HomeScreen}
                options={{
                    title: 'Ankiety',
                    headerStyle: { backgroundColor: '#2196F3' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <Stack.Screen
                name="SurveyForm"
                component={SurveyForm}
                options={{
                    title: 'Formularz Ankiety',
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

export default function App() {
    return (
        <SurveyProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                    <Stack.Screen name="SurveyForm" component={SurveyForm} />
                    <Stack.Screen name="Summary" component={SummaryScreen} />
                    <Stack.Screen name="SurveyChange" component={SurveyDetails} />
                    <Stack.Screen name="addUserScreen" component={AddUserScreen} />
                    <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
                </Stack.Navigator>      
            </NavigationContainer>
        </SurveyProvider>
    );
}

function MainTabNavigator() {
    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
    
                switch (route.name) {
                    case 'Home':
                        iconName = 'home';
                        break;
                    case 'Statistics':
                        iconName = 'ssid-chart';
                        break;
                    case 'Ranking':
                        iconName = 'leaderboard';
                        break;
                    case 'Settings':
                        iconName = 'settings';
                        break;
                    case 'Surveys':
                        iconName = 'assignment';
                        break;
                    default:
                        iconName = 'home';
                }
    
                return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#ffffff', 
            tabBarInactiveTintColor: '#000000', 
            tabBarStyle: {
                backgroundColor: '#ff9800',
                height: 50,
            },
        })}
    >
        <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Strona Główna', headerShown: false }}
        />
        <Tab.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{ title: 'Statystyki', headerShown: false }}
        />
        <Tab.Screen
            name="Ranking"
            component={RankingScreen}
            options={{ title: 'Ranking', headerShown: false }}
        />
        <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Ustawienia', headerShown: false }}
        />
    </Tab.Navigator>
    
    );
}
