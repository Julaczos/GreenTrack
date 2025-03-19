import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './../supabaseClient'; // Importujemy klienta Supabase
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const { user, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert('Błąd', error.message);
            } else {
                Alert.alert('Sukces', 'Zalogowano pomyślnie!');
                navigation.navigate('Home'); // Przekierowanie do ekranu głównego
            }
        } catch (error) {
            Alert.alert('Błąd', 'Coś poszło nie tak');
        }
    };

    return (
        <LinearGradient colors={['#063607', '#247826', '#0c3b0d']} style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.logoContainer}>
                <Ionicons name="earth" size={100} color="white" />
                <Text style={styles.title}>GreenTrack</Text>
                <Text style={styles.subtitle}>Zaloguj się i zacznij działać na rzecz planety</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Adres e-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholderTextColor="#ccc"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Hasło"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#ccc"
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                        <Text style={styles.buttonText}>Zaloguj się</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerText}>Nie masz konta? Zarejestruj się</Text>
                </TouchableOpacity>
            </View>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
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
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        padding: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        fontSize: 16,
    },
    button: {
        width: '80%',
        borderRadius: 25,
        overflow: 'hidden',
        marginTop: 20,
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
    registerText: {
        marginTop: 20,
        color: '#fff',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
