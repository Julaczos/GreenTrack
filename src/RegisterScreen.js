import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './../supabaseClient'; 
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');


    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Błąd', 'Hasła nie są identyczne');
            return;
        }

        try {
            const { user, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                Alert.alert('Błąd', signUpError.message);
                return;
            }

            const { data, error: usernameError } = await supabase
                .from('usernames')
                .upsert([
                    { email: email, username: username }  
                ]);

            if (usernameError) {
                Alert.alert('Błąd', usernameError.message);
                return;
            }

            Alert.alert('Sukces', 'Zarejestrowano pomyślnie!');
            navigation.navigate('Login');  
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
                <Text style={styles.subtitle}>Zarejestruj się, aby zacząć działać na rzecz planety</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#ccc"
                />

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

                <TextInput
                    style={styles.input}
                    placeholder="Potwierdź hasło"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor="#ccc"
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                        <Text style={styles.buttonText}>Zarejestruj się</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>Masz już konto? Zaloguj się</Text>
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
    loginText: {
        marginTop: 20,
        color: '#fff',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;
