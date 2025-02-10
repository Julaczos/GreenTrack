import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity  } from 'react-native';
import { useSurveyContext } from './SurveyContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from './../supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const StatisticsScreen = () => {
    const { currentUser } = useSurveyContext();
    const [points, setPoints] = useState(0);
    const [todaySurveysCount, setTodaySurveysCount] = useState(0);
    const [averageDailySurveys, setAverageDailySurveys] = useState(0);
    const [badges, setBadges] = useState([]);
    const [userLevel, setUserLevel] = useState(null);
    const navigation = useNavigation();

    const fetchUserPoints = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('points')
                .eq('login', currentUser.login)
                .single();

            if (error) throw error;
            setPoints(data.points || 0);
        } catch (error) {
            console.error('Błąd podczas pobierania punktów:', error.message);
        }
    };

    const fetchTodaySurveysCount = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        try {
            const { data, error } = await supabase
                .from('responses')
                .select('*')
                .eq('user_id', currentUser.user_id)
                .gte('created_at', today.toISOString());

            if (error) throw error;
            setTodaySurveysCount(data.length);
        } catch (error) {
            console.error('Błąd podczas pobierania liczby dzisiejszych ankiet:', error.message);
        }
    };

    const fetchAverageDailySurveys = async () => {
        const daysCount = 7;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysCount);

        try {
            const { data, error } = await supabase
                .from('responses')
                .select('created_at')
                .eq('user_id', currentUser.user_id);

            if (error) throw error;

            const responsesInRange = data.filter(response =>
                new Date(response.created_at) >= pastDate
            );

            const average = responsesInRange.length / daysCount;
            setAverageDailySurveys(average);
        } catch (error) {
            console.error('Błąd podczas pobierania średniej dziennej liczby ankiet:', error.message);
        }
    };

    const fetchUserBadges = async () => {
        try {
            const { data, error } = await supabase
                .from('user_badges')
                .select('badge_id, earned_at, badges(name, description, icon)')
                .eq('user_id', currentUser.user_id);
    
            if (error) throw error;
    
            const uniqueBadges = Array.from(new Map(data.map(b => [b.badge_id, b])).values());
    
            setBadges(uniqueBadges);
        } catch (error) {
            console.error('Błąd podczas pobierania odznak:', error.message);
        }
    };

    const fetchUserLevel = async () => {
        try {
            const { data, error } = await supabase
                .from('levels')
                .select('*')
                .lte('required_points', points)
                .order('required_points', { ascending: false })
                .limit(1);

            if (error) throw error;
            setUserLevel(data[0] || null);
        } catch (error) {
            console.error('Błąd podczas pobierania poziomu użytkownika:', error.message);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (currentUser) {
                fetchUserPoints();
                fetchTodaySurveysCount();
                fetchAverageDailySurveys();
                fetchUserBadges();
                fetchUserLevel();
            }
        }, [currentUser, points])
    );

    const renderBadge = ({ item }) => (
        <View style={styles.badgeContainer}>
            <Icon name={item.badges.icon} style={styles.badgeIcon} size={40} color="#4CAF50" />
            <Text style={styles.badgeName}>{item.badges.name}</Text>
            <Text style={styles.badgeDescription}>{item.badges.description}</Text>
        </View>
    );

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Statystyki</Text>
                
                <View style={styles.pointsContainer}>
                    <Text style={styles.points}>Zdobyte punkty: {points}</Text>
                </View>

                <View style={styles.statContainer}>
                    <Text style={styles.stat}>Pytania odpowiedziane dzisiaj: {todaySurveysCount}</Text>
                    <Text style={styles.stat}>Średnia dzienna pytań (7 dni): {averageDailySurveys.toFixed(2)}</Text>
                </View>

                {userLevel && (
                    <View style={styles.levelContainer}>
                        <Text style={styles.levelTitle}>Twoja ranga:</Text>
                        <Text style={styles.levelName}>{userLevel.name}</Text>
                        <Text style={styles.levelDescription}>{userLevel.description}</Text>
                    </View>
                )}

                <TouchableOpacity onPress={() => {
                    navigation.navigate('CardsScreen', { userId: currentUser.user_id })}} style={styles.button}>
                    <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient1}>
                        <Text style={styles.buttonText}>Zdobyte karty</Text>
                    </LinearGradient>
                </TouchableOpacity>

                
                <TouchableOpacity onPress={() => {
                    navigation.navigate('StreakScreen', { userId: currentUser.user_id })}} style={styles.button}>
                    <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient1}>
                        <Text style={styles.buttonText}>Zdobyte karty</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.badgesTitle}>Odznaki:</Text>
                {badges.length > 0 ? (
                    <FlatList
                        data={badges}
                        renderItem={renderBadge}
                        keyExtractor={(item) => item.badge_id.toString()}
                        contentContainerStyle={styles.badgesList}
                        scrollEnabled={false} 
                    />
                ) : (
                    <Text style={styles.noBadgesText}>Nie zdobyto jeszcze żadnych odznak.</Text>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    buttonGradient1: { paddingVertical: 15, borderRadius: 25, width: '100%', alignItems: 'center', alignContent: 'center' },
    button: {
        width: '45%',         
        borderRadius: 10,
        alignContent: 'center',
        overflow: 'hidden',   
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        zIndex: 2000,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    pointsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    points: {
        fontSize: 18,
        color: '#ff9800',
        fontWeight: 'bold',
    },
    statContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center', 
    },
    stat: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 5,
        textAlign: 'center'
    },
    badgesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 20,
        marginBottom: 10,
    },
    badgesList: {
        alignItems: 'center',
    },
    badgeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        width: 250,
        justifyContent: 'center',
    },
    badgeIcon: {
        marginBottom: 10,
    },
    badgeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff9800',
    },
    badgeDescription: {
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
    },
    noBadgesText: {
        fontSize: 20,
        color: '#ffffff',
        marginTop: 10,
    },
    levelContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    levelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    levelName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ff9800',
    },
    levelDescription: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
    },
});

export default StatisticsScreen;
