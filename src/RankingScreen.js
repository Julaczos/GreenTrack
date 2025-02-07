import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from './../supabaseClient'; 
import { LinearGradient } from 'expo-linear-gradient';

const RankingScreen = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.90,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const fetchRankingData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('login, points')
                .order('points', { ascending: false });

            if (error) throw error;

            let lastPoints = null;
            let lastRank = 0;
            let actualRank = 0;
            
            const rankedData = data.map((item, index) => {
                actualRank++;
                if (item.points !== lastPoints) {
                    lastRank = actualRank;
                }
                lastPoints = item.points;
                return { ...item, rank: lastRank };
            });

            setRankings(rankedData);
        } catch (error) {
            console.error('Error fetching ranking data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRankingData();
        }, [])
    );

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <Text style={styles.title}>Ranking</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#fff" />
            ) : (
                <FlatList
                    data={rankings}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={0.7}
                        >
                        <Animated.View style={styles.rankItem}>
                            <Text style={[styles.rankText, styles.rankPosition]}>
                                {`${item.rank}.`}
                            </Text>
                            <Text style={[styles.rankText, styles.rankLogin]}>
                                {item.login}
                            </Text>
                            <Text style={[styles.rankText, styles.rankPoints]}>
                                {`${item.points} pkt`}
                            </Text>
                        </Animated.View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </LinearGradient>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    rankItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        marginBottom: 10,
    },
    rankText: {
        fontSize: 18,
        color: '#ff9800',
    },
    rankPosition: {
        fontWeight: 'bold',
        color: '#ff9800', 
    },
    rankLogin: {
        fontWeight: 'bold',
        color: '#ffffff',
    },
    rankPoints: {
        fontWeight: 'bold',
        color: '#ff9800', 
    },
});

export default RankingScreen;
