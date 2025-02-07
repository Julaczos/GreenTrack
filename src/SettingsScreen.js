import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { useCallback } from 'react';
import { useSurveyContext } from './SurveyContext'; 
import { supabase } from './../supabaseClient'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { Feather } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';


const SettingsScreen = () => {
    const { addSurvey, addQuestionToSurvey, currentUser, setCurrentUser } = useSurveyContext(); 
    const [newSurveyTitle, setNewSurveyTitle] = useState(''); 
    const [surveys, setSurveys] = useState([]); 
    const [isAdmin, setIsAdmin] = useState(false); 
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);


    useEffect(() => {
        setIsAdmin(currentUser?.login === 'admin');
    }, [currentUser]);

    const fetchSurveys = async () => {
        const { data, error } = await supabase.from('surveys').select('*');
        if (error) Alert.alert('Błąd', error.message);
        else setSurveys(data);
    };
    
    useFocusEffect(
        useCallback(() => {
            fetchSurveys();
        }, [])
    );

    const handleAddSurvey = async () => {
        if (newSurveyTitle.trim()) {
            const { data, error } = await supabase
                .from('surveys')
                .insert([{ title: newSurveyTitle.trim() }])
                .select()
                .single();
            
            if (error) {
                Alert.alert('Błąd', error.message);
            } else if (data) {
                setSurveys((prevSurveys) => [
                    ...prevSurveys,
                    { survey_id: data.survey_id, title: data.title, is_visible: true }
                ]);
                setNewSurveyTitle('');
            }
        }
    };
    

    const handleToggleVisibility = async (surveyId, currentVisibility) => {
        const { error } = await supabase.from('surveys').update({ is_visible: !currentVisibility }).eq('survey_id', surveyId);
        if (error) Alert.alert('Błąd', error.message);
        else setSurveys(surveys.map(survey => survey.survey_id === surveyId ? { ...survey, is_visible: !currentVisibility } : survey));
    };

    const handleMakeSpecial = async (surveyId, currentSpecial) => {
        const { error } = await supabase
            .from('surveys')
            .update({ is_special: !currentSpecial })
            .eq('survey_id', surveyId);
    
        if (error) {
            Alert.alert('Błąd', error.message);
        } else {
            setSurveys(surveys.map(survey => 
                survey.survey_id === surveyId 
                    ? { ...survey, is_special: !currentSpecial } 
                    : survey
            ));
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleSendCodeToRandomUser = async () => {
        try {
            const { data: topUsers, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .order('points', { ascending: false }) 
                .limit(10);
            
            if (userError) {
                Alert.alert('Błąd', userError.message);
                return;
            }
    
            if (topUsers.length === 0) {
                Alert.alert('Brak użytkowników', 'Brak użytkowników w rankingu.');
                return;
            }
            const randomUser = topUsers[Math.floor(Math.random() * topUsers.length)];
    
            const { data: codes, error: codeError } = await supabase
                .from('codes')
                .select('code')
                .eq('is_used', false)  
                .limit(1); 
            
            if (codeError) {
                Alert.alert('Błąd', codeError.message);
                return;
            }
    
            if (codes.length === 0) {
                Alert.alert('Brak kodów', 'Brak dostępnych kodów.');
                return;
            }
    
            const codeToSend = codes[0].code; 
    
            
                Alert.alert('Sukces', `Kod został wysłany do użytkownika ${randomUser.user_id}`);
                const { error: updateError } = await supabase
                    .from('codes')
                    .update({ is_used: true })
                    .eq('code', codeToSend);
                
                if (updateError) throw updateError

                const { error } = await supabase.from('notifications').insert([
                    {
                      user_id: randomUser.user_id,
                      message: `Twój kod to: ${codeToSend}`,
                      is_read: false,
                    },
                  ]);
                  
                  if (error) {
                    Alert.alert('Błąd', error.message);
                  } else {
                    console.log('Powiadomienie zapisane w bazie');
                  }
            }  catch (error) {
            Alert.alert('Błąd', error.message);
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('message')
                    .eq('user_id', currentUser.user_id) 

                if (error) {
                    Alert.alert('Błąd', error.message);
                } else {
                    setNotifications(data);
                }
            } catch (error) {
                Alert.alert('Błąd', error.message);
            }
        };

        if (currentUser) {
            fetchNotifications(); 
        }
    }, [currentUser]); 

    if (!isAdmin) {
        if (!currentUser) {
            return (
                <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
                    <Text style={styles.title}>Brak danych</Text>
                    <Text>Nie znaleziono informacji o użytkowniku.</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Wyloguj się</Text>
                    </TouchableOpacity>
                </LinearGradient>
            );
        }
    
        return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.title}>Twoje dane</Text>

            <View style={styles.userInfo}>
                <Text style={styles.infoText}>Nazwa: {currentUser.display_name}</Text>
                <Text style={styles.infoText}>Data urodzenia: {currentUser.birthdate}</Text>
                <Text style={styles.infoText}>Login: {currentUser.login}</Text>
            </View>

            <View style={styles.notificationsContainer}>
                <Text style={styles.notificationsTitle}>Twoje powiadomienia</Text>
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <View key={index} style={styles.notificationItem}>
                            <Text style={styles.notificationText}>{notification.message}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noNotificationsText}>Brak nowych powiadomień</Text>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LinearGradient colors={['#f20c17', '#ad151c']} style={styles.buttonGradient1}>
                    <Text style={styles.buttonText}>Wyloguj się</Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
        );
    }
    
    

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <View>
                <Text style={styles.title}>Panel administratora</Text>
                <TextInput style={styles.input} placeholder="Wpisz tytuł ankiety" value={newSurveyTitle} onChangeText={setNewSurveyTitle} />
                <TouchableOpacity style={styles.addButton} onPress={handleAddSurvey}>
                    <Text style={styles.buttonText}>Dodaj nową ankietę</Text>
                </TouchableOpacity>
                <FlatList
                    data={surveys}
                    keyExtractor={(item) => item.survey_id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.surveyItem}>
                            <TouchableOpacity 
                                style={styles.surveyButton} 
                                onPress={() => navigation.navigate('SurveyChange', { surveyId: item.survey_id, surveyTitle: item.title })}
                            >
                                <Text style={styles.buttonText}>{item.title}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.toggleButton} 
                                onPress={() => handleToggleVisibility(item.survey_id, item.is_visible)}
                            >
                                <Feather 
                                    name={item.is_visible ? 'sun' : 'moon'}
                                    size={24}
                                    color="#fff" 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.specialButton}
                                onPress={() => handleMakeSpecial(item.survey_id, item.is_special)}
                            >
                               <Icon name={item.is_special ? 'star' : 'star-o'} size={24} color={item.is_special ? '#3b5998' : 'black'} />

                            </TouchableOpacity>
                        </View>
                    )}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleLogout} style={styles.button}>
                        <LinearGradient colors={['#f20c17', '#ad151c']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Wyloguj się</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSendCodeToRandomUser} style={styles.button}>
                        <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Losuj kod</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('addUserScreen')} style={styles.button}>
                        <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Dodaj użytkownika</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('NotificationsScreen')} style={styles.button}>
                        <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Powiadomienia</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
    input: { height: 45, borderColor: '#ccc', borderWidth: 1, marginBottom: 15, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
    addButton: { backgroundColor: '#ff9800', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    surveyButton: { backgroundColor: '#ff9800', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 5, flex: 1 },
    toggleButton: { backgroundColor: '#ffbb33', padding: 5, borderRadius: 5, alignItems: 'center', marginBottom: 10, flex: 1, minwidth: 3, justifyContent: 'center', marginRight: 10, marginLeft: 10 },
    specialButton: { backgroundColor: '#ff9800', padding: 5, borderRadius: 5, alignItems: 'center', marginBottom: 10, flex: 1, minWidth: 3, justifyContent: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    buttonGradient1: { paddingVertical: 15, borderRadius: 25, width: '50%', alignItems: 'center', alignContent: 'center', marginLeft: 90, },
    surveyItem: { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    userInfo: {backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center',},
    infoText: {fontSize: 18, color: '#fff', marginBottom: 5,},
    buttonGradient2: {paddingVertical: 15, borderRadius: 25, width: '50%', alignItems: 'center', alignContent: 'center', marginLeft: 90, marginTop: 10,},
    notificationsContainer: { marginTop: 20 },
    notificationsTitle: { fontSize: 20, color: '#fff', marginBottom: 10 },
    notificationItem: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 20,
    },
    notificationText: { fontSize: 16, color: '#000' },
    noNotificationsText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
    buttonContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap',    
        justifyContent: 'center', 
        gap: 10,             
        marginTop: 20,
    },
    button: {
        width: '45%',         
        borderRadius: 10,
        overflow: 'hidden',   
    },
    buttonGradient: {
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    

});

export default SettingsScreen;
