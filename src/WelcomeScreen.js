import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const WelcomeScreen = () => {
    const navigation = useNavigation();

    return (
        <LinearGradient colors={['#063607', '#247826', '#0c3b0d']} style={styles.container}>
            <StatusBar style="light" />
            
            <View style={styles.logoContainer}>
                <Ionicons name="earth" size={100} color="white" />
                <Text style={styles.title}>GreenTrack</Text>
                <Text style={styles.subtitle}>Zmieniaj świat na lepsze dzięki prostym eko-akcjom!</Text>
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
