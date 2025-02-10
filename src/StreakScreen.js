import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../supabaseClient';

const StreakScreen = ({ route }) => {
    const { userId } = route.params || {};
    const [surveyLogs, setSurveyLogs] = useState([]);
    const [streak, setStreak] = useState(0);

    const fetchSurveyLogs = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('completed_surveys')
                .select('created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });
    
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Błąd pobierania historii ankiet:', error.message);
            return [];
        }
    };
    
    const calculateStreak = (logs) => {
        if (logs.length === 0) return 0;
    
        let streak = 0;
        let today = new Date().setHours(0, 0, 0, 0); // Dzisiaj o 00:00
        let previousDate = today;
    
        for (let i = logs.length - 1; i >= 0; i--) {
            const logDate = new Date(logs[i].completed_at).setHours(0, 0, 0, 0);
    
            if (logDate === previousDate) {
                continue; // Ta sama data, kontynuujemy
            } else if (logDate === previousDate - 86400000) { 
                // Dzień wcześniej
                streak++;
                previousDate = logDate;
            } else {
                break; // Przerwanie streaka
            }
        }
        return streak + 1;
    };
    


    useEffect(() => {
        const fetchData = async () => {
            const logs = await fetchSurveyLogs(userId);
            setSurveyLogs(logs);
            setStreak(calculateStreak(logs));
        };
        fetchData();
    }, []);

    const markedDates = surveyLogs.reduce((acc, log) => {
        const date = log.completed_at.split('T')[0];
        acc[date] = { marked: true, dotColor: 'orange' };
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>🔥 Streak: {streak} dni</Text>
            <Calendar
                markedDates={markedDates}
                theme={{
                    todayTextColor: '#ff9800',
                    arrowColor: '#ff9800',
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
    heading: { fontSize: 24, fontWeight: 'bold', color: '#ff9800', textAlign: 'center', marginBottom: 20 },
});

export default StreakScreen;
