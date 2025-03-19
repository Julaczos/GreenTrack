import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigation.replace('Login');
    };

    return (
        <LinearGradient colors={['#063607', '#247826', '#0c3b0d']} style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Ionicons name="leaf" size={40} color="white" />
                <Text style={styles.title}>GreenTrack</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.welcomeText}>Witaj w GreenTrack!</Text>
                <Text style={styles.description}>Śledź swoje ekologiczne działania i zmieniaj świat!</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>Wyloguj się</Text>
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
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    content: {
        alignItems: 'center',
        marginBottom: 50,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 10,
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

export default HomeScreen;
