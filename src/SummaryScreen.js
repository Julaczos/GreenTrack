import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSurveyContext } from './SurveyContext';
import { supabase } from './../supabaseClient'; 
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';


const SummaryScreen = ({ route, navigation }) => {
    const { answers, surveyId, timeTaken } = route.params || {};
    const { currentUser } = useSurveyContext();
    const [isUpdated, setIsUpdated] = useState(false);
    const pointsPerAnswer = 15;
    const [isSpecial, setIsSpecial] = useState(false);
    const [createdAt, setCreatedAt] = useState(null);
    const [lastActivity, setLastActivity] = useState(null);    
    const [animationFinished, setAnimationFinished] = useState(false);


    useFocusEffect(
        React.useCallback(() => {
            const fetchSurveyCreatedAt = async () => {
                try {
                    const { data, error } = await supabase
                        .from('surveys')
                        .select('created_at, is_special')
                        .eq('survey_id', surveyId)
                        .single();
    
                    if (error) throw error;
                    setCreatedAt(data.created_at);
                    setIsSpecial(data.is_special);
                } catch (error) {
                    console.error('Błąd pobierania daty utworzenia ankiety:', error.message);
                }
            };
    
            fetchSurveyCreatedAt();
        }, [surveyId])
    );

    useFocusEffect(
        React.useCallback(() => {
            const fetchLastActivity = async () => {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('last_activity')
                        .eq('user_id', currentUser.user_id)
                        .single();
    
                    if (error) throw error;
                    setLastActivity(data.last_activity);
                } catch (error) {
                    console.error('Błąd pobierania ostatniej aktywności:', error.message);
                }
            };
    
            fetchLastActivity();
        }, [currentUser.user_id])
    );

    const calculatePoints = () => {
        if (!createdAt) return pointsPerAnswer;
    
        const now = new Date();
        const surveyCreatedAt = new Date(createdAt);
        let points = (now - surveyCreatedAt) < 60 * 60 * 1000 ? 20 : pointsPerAnswer;
    
        if (isSpecial) {
            points += 10; 
        }

        if (lastActivity) {
            const lastActiveDate = new Date(lastActivity);
            const diffInDays = Math.floor((now - lastActiveDate) / (1000 * 60 * 60 * 24));
            if (diffInDays >= 7) {
                points += 20;
            }
        }
        return points;
    };
    

    const pointsEarned = Array.isArray(answers) ? answers.length * calculatePoints() : 0;


    useFocusEffect(
        React.useCallback(() => {
            updateStatisticsAndBadges().then(() => setIsUpdated(true));
        }, [])
    );
    
    const updateLastActivity = async () => {
        try {
            const currentDate = new Date();
            const { error } = await supabase
                .from('users')
                .update({ last_activity: currentDate })
                .eq('user_id', currentUser.user_id);
    
            if (error) {
                console.log("Błąd aktualizacji last_activity", error.message);
            }
        } catch (error) {
            console.log("Błąd aktualizacji last_activity", error.message);
        }
    };
    

    const updateStatisticsAndBadges = async () => {
        try {
            const { data: userStats, error: statsError } = await supabase
                .from('users')
                .select('completed_surveys, points')
                .eq('user_id', currentUser.user_id)
                .single();

            if (statsError) throw statsError;
            calculatePoints();
            const x = Array.isArray(answers) ? answers.length * calculatePoints() : 0
            const newSurveyCount = (userStats.completed_surveys || 0) + 1;
            const newPoints = (userStats.points || 0) + x;  
            const now = new Date();

            const { error: updateError } = await supabase
                .from('users')
                .update({ completed_surveys: newSurveyCount, points: newPoints, last_activity: now.toISOString()})
                .eq('user_id', currentUser.user_id);

            if (updateError) throw updateError

            const { error: insertError } = await supabase
            .from('completed_surveys')
            .insert([{
                user_id: currentUser.user_id,
                survey_id: surveyId,
                created_at: new Date(), 
            }]);

            if (insertError) throw insertError;

            await checkAndAwardBadges(newSurveyCount);
            await awardCard(currentUser.user_id);
        } catch (error) {
            console.error('Błąd aktualizacji statystyk lub odznak:', error.message);
        }
    };

    const awardCard = async (userId) => {
        try {
            // Pobierz wszystkie dostępne karty
            const { data: cards, error: cardsError } = await supabase.from('cards').select('*');
            if (cardsError) throw cardsError;
    
            // Losowanie karty (np. losujemy jedną kartę)
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            console.log(randomCard);
    
            // Sprawdź, czy użytkownik już posiada tę kartę, ale nie sprawdzaj, czy ma ją tylko raz, zliczaj wszystkie powtórzenia
            const { data: userCards, error: userCardsError } = await supabase
                .from('user_cards')
                .select('*')
                .eq('user_id', userId)
                .eq('card_id', randomCard.card_id);
    
            if (userCardsError) throw userCardsError;
    
            if (userCards.length > 0) {
                // Jeśli karta już istnieje, zwiększ licznik
                const currentCard = userCards[0];
                await supabase
                    .from('user_cards')
                    .update({ count: currentCard.count + 1 })
                    .eq('user_id', userId)
                    .eq('card_id', randomCard.card_id);
            } else {
                // Jeśli karta nie istnieje, dodaj ją do tabeli z licznikiem 1
                await supabase.from('user_cards').insert({
                    user_id: userId,
                    card_id: randomCard.card_id,
                    earned_at: new Date(),
                    count: 1,
                });
            }
    
            // Pokazujemy powiadomienie
            Toast.show({
                type: 'success',
                text1: 'Gratulacje!',
                text2: `Zdobyłeś kartę: ${randomCard.name}`,
                position: 'top',
                visibilityTime: 4000,
                text1Style: { fontSize: 18, fontWeight: 'bold' },
                text2Style: { fontSize: 15 },
            });
        } catch (error) {
            console.error('Błąd przyznawania karty:', error.message);
        }
    };
    

    const getUserSurveyCompletions = async (userId) => {
        const { data, error } = await supabase
            .from('completed_surveys')
            .select('created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
    
        if (error) {
            console.error("Błąd pobierania historii ankiet:", error);
            return [];
        }
        return data.map(item => new Date(item.created_at));
    };

    const checkConsecutiveDays = (dates, condition) => {
        if (dates.length < condition) return false;
    
        const uniqueDays = [...new Set(dates.map(date => date.toISOString().split('T')[0]))];
    
        if (uniqueDays.length < condition) return false;
    
        let count = 1; 
        for (let i = uniqueDays.length - 1; i > 0; i--) {
            const prevDate = new Date(uniqueDays[i - 1]);
            const currentDate = new Date(uniqueDays[i]);

            const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
    
            if (diff === 1) {
                count++;
            } else if (diff > 1) {
                count = 1; 
            }
    
            if (count === condition) return true;
        }
    
        return false;
    };
    
    
    const checkAndAwardBadges = async (surveyCount) => {
        try {
            const daysCount = 7;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysCount);
    
            const { data, error } = await supabase
                .from('responses')
                .select('created_at')
                .eq('user_id', currentUser.user_id);
    
            if (error) throw error;
    
            const responsesInRange = data.filter(
                (response) => new Date(response.created_at) >= pastDate
            );
    
            const averageDailySurveys = responsesInRange.length / daysCount;
    
            const { data: badges, error: badgesError } = await supabase.from('badges').select('*');
            if (badgesError) throw badgesError;
    
            const { data: userBadges } = await supabase
                .from('user_badges')
                .select('badge_id')
                .eq('user_id', currentUser.user_id);
    
            const earnedBadgeIds = userBadges ? userBadges.map((badge) => badge.badge_id) : [];
    
            let newBadges = [];
            let bestTimeBadge = null;
    
            for (const badge of badges) {
                if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'survey_count' &&
                    surveyCount >= badge.condition
                ) {
                    await supabase.from('user_badges').insert({
                        user_id: currentUser.user_id,
                        badge_id: badge.badge_id,
                        earned_at: new Date(),
                    });
    
                    newBadges.push(badge);
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'weekly_average' &&
                    averageDailySurveys >= badge.condition
                ) {
                    await supabase.from('user_badges').insert({
                        user_id: currentUser.user_id,
                        badge_id: badge.badge_id,
                        earned_at: new Date(),
                    });
    
                    newBadges.push(badge);
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'time_based'
                ) {
                    const lastResponse = data[data.length - 1];
                    if (lastResponse) {
                        const responseHour = new Date(lastResponse.created_at).getHours();
    
                        if (responseHour < badge.condition) {
                            if (!bestTimeBadge || badge.condition < bestTimeBadge.condition) {
                                bestTimeBadge = badge;
                            }
                        }
                    }
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'speed' &&
                    timeTaken < badge.condition
                ) {
                    await supabase.from('user_badges').insert({
                        user_id: currentUser.user_id,
                        badge_id: badge.badge_id,
                        earned_at: new Date(),
                    });
    
                    newBadges.push(badge);
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'number_of_questions' &&
                    answers.length >= badge.condition
                ) {
                    await supabase.from('user_badges').insert({
                        user_id: currentUser.user_id,
                        badge_id: badge.badge_id,
                        earned_at: new Date(),
                    });
    
                    newBadges.push(badge);
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'slow' &&
                    timeTaken > badge.condition
                ) {
                    await supabase.from('user_badges').insert({
                        user_id: currentUser.user_id,
                        badge_id: badge.badge_id,
                        earned_at: new Date(),
                    });
    
                    newBadges.push(badge);
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'week_day'
                ) {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
    
                    if (dayOfWeek === badge.condition) {
                        await supabase.from('user_badges').insert({
                            user_id: currentUser.user_id,
                            badge_id: badge.badge_id,
                            earned_at: new Date(),
                        });
    
                        newBadges.push(badge);
                    }
                } else if (
                    !earnedBadgeIds.includes(badge.badge_id) &&
                    badge.type === 'streak'
                ) {
                    const dates = await getUserSurveyCompletions(currentUser.user_id);
                    if (checkConsecutiveDays(dates, badge.condition)) {
                        await supabase.from('user_badges').insert({
                            user_id: currentUser.user_id,
                            badge_id: badge.badge_id,
                            earned_at: new Date(),
                        });
    
                        newBadges.push(badge);
                    }
                }
            }
    
            if (bestTimeBadge) {
                await supabase.from('user_badges').insert({
                    user_id: currentUser.user_id,
                    badge_id: bestTimeBadge.badge_id,
                    earned_at: new Date(),
                });
    
                newBadges.push(bestTimeBadge);
            }
    
            if (newBadges.length > 0) {
                showToastsSequentially(newBadges);
            }
    
        } catch (error) {
            console.error('Błąd przyznawania odznak:', error.message);
        }
    };
    
    const showToastsSequentially = (badges) => {
        badges.forEach((badge, index) => {
            setTimeout(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Gratulacje!',
                    text2: `Zdobyłeś odznakę: ${badge.name}`,
                    position: 'top',
                    visibilityTime: 4000,
                    text1Style: { fontSize: 22, fontWeight: 'bold' },
                    text2Style: { fontSize: 15 },
                });
            }, index * 4500);
        });
    };
    
    
    
    useEffect(() => {
        updateLastActivity();
    }, [currentUser]);
    
    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <LottieView source={require('./../assets/confetti.json')} autoPlay loop={false} onAnimationFinish={() => setAnimationFinished(true)} 
                style={[styles.lottie, animationFinished && { display: 'none' }]} resizeMode='cover' pointerEvents="none" />
            <Text style={styles.title}>Dziękujemy za Twój wkład!</Text>
            <Text style={styles.subtitle1}>Twoje zaangażowanie ma ogromne znaczenie – każda odpowiedź przyczynia się do rozwoju nauki i poprawy jakości opieki medycznej. 
                Twoja opinia to krok w stronę lepszej medycyny! Dziękujemy za czas, zaufanie i wkład w to ważne badanie.
            </Text>
            <Text style={styles.subtitle}>Zdobyto punkty: {pointsEarned}</Text>
            <View style={styles.answersContainer}>
                {Array.isArray(answers) ? (
                    answers.map((answer, index) => (
                        <Text key={index} style={styles.answerText}>
                            Pytanie {index + 1}: {answer}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.answerText}>Brak odpowiedzi.</Text>
                )}
            </View>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
                <LinearGradient colors={['#ff9800', '#ff5722']} style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>Wróć do głównego ekranu</Text>
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
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 20,
        color: '#ff9800',
        marginBottom: 20,
    },
    subtitle1: {
        fontSize: 15,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    answersContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 15,
        borderRadius: 10,
        width: '90%',
        marginBottom: 20,
    },
    answerText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        zIndex: 2000,
    },
    buttonGradient: {
        paddingVertical: 15,
        borderRadius: 25,
        padding: 20,
        alignItems: 'center',
    },
    lottie: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'none',
    },    
});

export default SummaryScreen;
