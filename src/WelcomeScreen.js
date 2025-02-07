import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';

const WelcomeScreen = () => {
    const navigation = useNavigation();

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <StatusBar style="light" />
            
            <View style={styles.logoContainer}>
                <AntDesign name="form" size={80} color="white" />
                <Text style={styles.title}>Witaj w SurveyApp</Text>
                <Text style={styles.subtitle}>Odpowiadaj, zbieraj punkty i zdobywaj odznaki!</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>Zaloguj się</Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 20,
    },
    button: {
        width: '80%',
        borderRadius: 25,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
