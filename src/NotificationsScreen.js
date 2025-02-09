import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './../supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }), 
});

const NotificationsScreen = () => {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
                saveTokenToSupabase(token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('📩 Otrzymano powiadomienie:', notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👉 Kliknięto powiadomienie:', response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const saveTokenToSupabase = async (token) => {
        const { error } = await supabase
            .from('device_tokens')
            .upsert({ token }, { onConflict: ['token'] });

        if (error) console.error('❌ Błąd zapisu tokena:', error.message);
        else console.log('✅ Token zapisany w Supabase:', token);
    };

    const sendTestNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Przypomnienie',
                body: 'Hej, hej, pamiętaj o swojej codziennej ankiecie!',
            },
            trigger: { seconds: 2 },
        });
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.title}>Powiadomienia</Text>
            <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
                <Text style={styles.buttonText}>Wyślij powiadomienie</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
        Alert.alert('❌ Symulator nie obsługuje powiadomień');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        Alert.alert('❌ Brak zgody na powiadomienia');
        return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    return token;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    tokenText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ff9800',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default NotificationsScreen;
