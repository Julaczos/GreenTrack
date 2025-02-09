import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './../supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const rarityColors = {
    common: ['#ffffff', '#dcdcdc'], 
    rare: ['#87e65c', '#87e65c'], 
    epic: ['#c471ed', '#c66df2'],
    legendary: ['#fbd786', '#f5d182'], 
    unknown: ['#cccccc', '#999999'] 
};

const CardsScreen = ({ route }) => {
    const [cards, setCards] = useState([]);
    const [userCards, setUserCards] = useState(new Set());
    const { userId } = route.params || {}; 

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const { data: allCards, error: allCardsError } = await supabase.from('cards').select('*');
            if (allCardsError) throw allCardsError;

            const { data: userCardsData, error: userCardsError } = await supabase
                .from('user_cards')
                .select('card_id')
                .eq('user_id', userId);

            if (userCardsError) throw userCardsError;

            const userCardIds = new Set(userCardsData.map(card => card.card_id));

            setCards(allCards || []);
            setUserCards(userCardIds);
        } catch (error) {
            console.error('Błąd podczas pobierania kart:', error.message);
        }
    };

    const renderCardItem = ({ item }) => {
        const isUnlocked = userCards.has(item.card_id);
        const rarity = item.rarity?.toLowerCase() || 'common';
        const colors = isUnlocked ? rarityColors[rarity] || rarityColors.common : rarityColors.unknown;

        return (
            <LinearGradient colors={colors} style={[styles.cardContainer, !isUnlocked && styles.cardDisabled]}>
                {!isUnlocked ? (
                    <Icon name="question-mark" size={100} color="#777" style={styles.cardImage} />
                ) : (
                    <Image source={{ uri: item.image_url }} style={styles.cardImage} />
                )}
                <Text style={[styles.cardTitle, !isUnlocked && styles.textDisabled]}>{item.name}</Text>
                <Text style={[styles.cardDescription, !isUnlocked && styles.textDisabled]}>{isUnlocked ? item.description : '???'}</Text>
                <Text style={[styles.cardCount, !isUnlocked && styles.textDisabled]}>
                    {isUnlocked ? `Zdobyto` : 'Nie zdobyto'}
                </Text>
            </LinearGradient>
        );
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.heading}>Twoje Karty</Text>
            <FlatList
                data={cards}
                renderItem={renderCardItem}
                keyExtractor={(item) => item.card_id.toString()}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    heading: {
        marginTop: 20,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    cardContainer: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    cardDisabled: {
        opacity: 0.6,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    cardDescription: {
        fontSize: 16,
        color: 'black',
        marginTop: 4,
    },
    cardCount: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    textDisabled: {
        color: '#777',
    }
});

export default CardsScreen;
