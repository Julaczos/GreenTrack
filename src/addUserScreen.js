import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';
import Toast from 'react-native-toast-message';

const AddUserScreen = ({ navigation }) => {
    const [login, setlogin] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setbirthdate] = useState('');
    const [display_name, setDisplay_name] = useState('');

    const handleAddUser = async () => {
        if (!login || !password || !birthdate || !display_name) {
            Toast.show({
                type: 'error', 
                text1: 'Brak danych',
                text2: 'Wpisz poprawne dane!',
                position: 'top',
                visibilityTime: 4000,
                text1Style: { fontSize: 18, fontWeight: 'bold' },
                text2Style: { fontSize: 15 },
            });                        
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([{ login, password, display_name, birthdate, points: 0, last_activity: new Date() }]);
            
            if (error) throw error;
            
            Toast.show({
                type: 'success', 
                text1: 'Sukces!',
                text2: 'Użytkownik poprawnie dodany!',
                position: 'top',
                visibilityTime: 4000,
                text1Style: { fontSize: 18, fontWeight: 'bold' },
                text2Style: { fontSize: 15 },
            });            
            navigation.goBack();
        } catch (err) {
            Alert.alert('Błąd', err.message);
        }
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.title}>Dodaj nowego użytkownika</Text>
            <TextInput
                style={styles.input}
                placeholder="Login"
                value={login}
                onChangeText={setlogin}
            />
            <TextInput
                style={styles.input}
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Imię i nazwisko"
                value={display_name}
                onChangeText={setDisplay_name}
            />
            <TextInput
                style={styles.input}
                placeholder="Data urodzenia (RRRR-MM-DD)"
                value={birthdate}
                onChangeText={setbirthdate}
            />
            <View style={styles.buttonContainer}>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
                <Text style={styles.buttonText}>Dodaj</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: 'white' },
    input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingHorizontal: 10, backgroundColor: 'white' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    roleButton: { flex: 1, padding: 10, backgroundColor: '#ddd', marginHorizontal: 5, alignItems: 'center', borderRadius: 5 },
    selectedRole: { backgroundColor: '#ff9800' },
    addButton: { backgroundColor: '#4c669f', padding: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default AddUserScreen;
