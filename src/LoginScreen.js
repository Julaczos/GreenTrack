import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';
import { useSurveyContext } from './SurveyContext';
import { FontAwesome } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const { setCurrentUser } = useSurveyContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('login', username)
                .eq('password', password)
                .single();

            if (error) throw error;

            if (data) {
                setCurrentUser(data);
                navigation.navigate('Main');
            }
        } catch (error) {
            Alert.alert('Błąd logowania', 'Nieprawidłowa nazwa użytkownika lub hasło.');
        }
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <View style={styles.logoContainer}>
                <FontAwesome name="user-circle" size={80} color="white" />
                <Text style={styles.header}>Logowanie</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Nazwa użytkownika"
                placeholderTextColor="#ddd"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Hasło"
                placeholderTextColor="#ddd"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
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
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        padding: 15,
        marginBottom: 15,
        color: '#fff',
        fontSize: 16,
    },
    button: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
        marginTop: 10,
    },
    buttonGradient: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default LoginScreen; 