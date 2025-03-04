import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

const polishMonths = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const StreakScreen = ({ route }) => {
    const { userId } = route.params || {};
    const [surveyLogs, setSurveyLogs] = useState([]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const fetchSurveyLogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('completed_surveys')
                    .select('created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                setSurveyLogs(data);
                setStreak(calculateStreak(data));
            } catch (error) {
                console.error('Błąd pobierania historii ankiet:', error.message);
            }
        };

        fetchSurveyLogs();
    }, []);

    const calculateStreak = (logs) => {
        if (logs.length === 0) return 0;

        let streak = 0;
        let today = new Date().setHours(0, 0, 0, 0);
        let previousDate = today;

        const hasTodayEntry = logs.some(log => new Date(log.created_at).setHours(0, 0, 0, 0) === today);
        

        for (let i = logs.length - 1; i >= 0; i--) {
            const logDate = new Date(logs[i].created_at).setHours(0, 0, 0, 0);

            if (logDate === previousDate) {
                continue;
            } else if (logDate === previousDate - 86400000) {
                streak++;
                previousDate = logDate;
            } else {
                break;
            }
        }
        if (!hasTodayEntry) return streak;
        return streak + 1;
    };

    const markedDates = surveyLogs.reduce((acc, log) => {
        const date = log.created_at.split('T')[0];
        acc[date] = { selected: true, selectedColor: '#ff9800' };
        return acc;
    }, {});

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.heading}>Seria: {streak} dni</Text>
            <View style={styles.calendarContainer}>
                <Calendar
                    markedDates={markedDates}
                    theme={{
                        calendarBackground: 'transparent',
                        todayTextColor: '#ff9800',
                        arrowColor: '#ff9800',
                        dayTextColor: '#ffffff',
                        monthTextColor: '#ffffff',
                        textDisabledColor: 'darkgrey',
                        selectedDayBackgroundColor: '#ff9800',
                    }}
                    monthFormat={'yyyy MM'}
                    renderHeader={(date) => {
                      const dateObj = new Date(date);
                      const monthIndex = dateObj.getMonth();
                      const year = dateObj.getFullYear();
                      return <Text style={styles.monthHeader}>{polishMonths[monthIndex]} {year}</Text>;
                    }}
                    firstDay={1} 
                  />
                </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff9800',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    calendarContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 10,
    },
    monthHeader: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
});
export default StreakScreen;
