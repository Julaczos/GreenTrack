import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useSurveyContext } from './SurveyContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';  
import { supabase } from '../supabaseClient'; 
import Toast from 'react-native-toast-message';

const HomeScreen = ({ navigation }) => {
    const { currentUser } = useSurveyContext();
    const [surveys, setSurveys] = useState([]);
    const [completedSurveys, setCompletedSurveys] = useState(new Set()); 
    const scaleValue = new Animated.Value(1);

    const fetchNotifications = async () => {
        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.user_id)
          .eq('is_read', false); 
        
        if (error) {
          Alert.alert('Błąd', error.message);
        } else {
          notifications.forEach(notification => {
            Toast.show({
                type: 'success', 
                text1: 'Gratulacje',
                text2: `${notification.message}`,
                position: 'top',
                visibilityTime: 5000,
                text1Style: { fontSize: 18, fontWeight: 'bold' },
                text2Style: { fontSize: 15 },
            });            
            console.log(notification.id)
            markNotificationAsRead(notification.id)
          });
        }
      };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId); 
    
            if (error) {
                Alert.alert('Błąd', error.message);
            }

        } catch (error) {
            Alert.alert('Błąd', 'Wystąpił problem podczas aktualizacji powiadomienia');
        }
    };
    

    const fetchSurveys = async () => {
        try {
            const { data, error } = await supabase
                .from('surveys')
                .select('*')
                .eq('is_visible', true);

            if (error) throw error;
            setSurveys(data);  
        } catch (error) {
            console.error('Error fetching surveys:', error);
        }
    };

    const fetchCompletedSurveys = async () => {
        try {
            const { data, error } = await supabase
                .from('completed_surveys')
                .select('survey_id')
                .eq('user_id', currentUser.user_id);

            if (error) throw error;

            const completedIds = new Set(data.map(item => item.survey_id));
            setCompletedSurveys(completedIds);
        } catch (error) {
            console.error('Error fetching completed surveys:', error);
        }
    };

    const updateUserActivity = async (userId) => {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('last_activity, points')
                .eq('user_id', currentUser.user_id)
                .single();
    
            if (error) throw error;
    
            const lastActivity = new Date(user.last_activity);
            const now = new Date();
            
            const diffInDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
            if (diffInDays >= 7) { 
                Toast.show({
                    type: 'error', 
                    text1: 'Sukces!',
                    text2: `Kod wysłany do użytkownika ${randomUser.user_id}`,
                    position: 'top',
                    visibilityTime: 4000,
                    text1Style: { fontSize: 18, fontWeight: 'bold' },
                    text2Style: { fontSize: 15 },
                    
                });
                const newPoints = Math.max(0, Math.floor(user.points * 0.9)); 
    
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ points: newPoints})
                    .eq('user_id', currentUser.user_id);
    
                if (updateError) throw updateError;
    
                console.log(`Punkty zaktualizowane. Nowa liczba punktów: ${newPoints}`);
            } 
        } catch (err) {
            console.error('Błąd aktualizacji aktywności:', err.message);
        }
    };
    

    useEffect(() => {
        updateUserActivity();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchSurveys();
            fetchCompletedSurveys();  
            fetchNotifications();
        }, [])  
    );

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleSurveyPress = (surveyId) => {
        navigation.navigate('SurveyForm', { surveyId });
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.title}>Moje Ankiety</Text>
            {surveys.length > 0 ? (
                <FlatList
                    data={surveys}
                    keyExtractor={(item) => item.survey_id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSurveyPress(item.survey_id)}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[styles.surveyCard, { transform: [{ scale: scaleValue }] }]} >
                                <Feather name="clipboard" size={24} color="#ff9800" />
                                <Text style={styles.surveyTitle}>{item.title}</Text>
                                {completedSurveys.has(item.survey_id) ? (
                                    <Feather name="check-circle" size={24} color="lightgreen" />
                                ) : (
                                    <Feather name="circle" size={24} color="gray" />
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.noSurveysText}>Brak dostępnych ankiet.</Text>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    surveyCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    surveyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
        flex: 1, 
    },
    noSurveysText: {
        fontSize: 18,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default HomeScreen;
