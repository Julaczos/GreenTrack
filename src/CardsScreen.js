import * as React from "react";
import { Dimensions, Text, View, Image, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { supabase } from "./../supabaseClient";

const { width } = Dimensions.get("window");

const rarityColors = {
  common: ["#ffffff", "#dcdcdc"],
  rare: ["#87e65c", "#66ad45"],
  epic: ["#c471ed", "#c66df2"],
  legendary: ["#fbd786", "#f5d182"],
  unknown: ["#cccccc", "#999999"],
};

function CardsScreen({ route }) {
  const [cards, setCards] = React.useState([]);
  const [userCards, setUserCards] = React.useState(new Set());
  const { userId } = route.params || {};

  const carouselRef = React.useRef(null);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data: allCards, error: allCardsError } = await supabase
        .from("cards")
        .select("*");
      if (allCardsError) throw allCardsError;

      const { data: userCardsData, error: userCardsError } = await supabase
        .from("user_cards")
        .select("card_id")
        .eq("user_id", userId);

      if (userCardsError) throw userCardsError;

      const userCardIds = new Set(userCardsData.map((card) => card.card_id));

      setCards(allCards || []);
      setUserCards(userCardIds);
    } catch (error) {
      console.error("Błąd podczas pobierania kart:", error.message);
    }
  };

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const renderCardItem = ({ item }) => {
    const isUnlocked = userCards.has(item.card_id);
    const rarity = item.rarity?.toLowerCase() || "common";
    const colors = isUnlocked ? rarityColors[rarity] || rarityColors.common : rarityColors.unknown;

    return (
      <LinearGradient colors={colors} style={styles.cardContainer}>
        {!isUnlocked ? (
          <Icon name="question-mark" size={100} color="#777" style={styles.Question} />
        ) : (
          <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        )}
        <Text style={[styles.cardTitle, !isUnlocked && styles.textDisabled]}>{item.name}</Text>
        <Text style={[styles.cardDescription, !isUnlocked && styles.textDisabled]}>
          {isUnlocked ? item.description : "???"}
        </Text>
        <Text style={[styles.cardCount, !isUnlocked && styles.textDisabled]}>
          {isUnlocked ? "Zdobyto" : "Nie zdobyto"}
        </Text>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <Text style={styles.heading}>Twoje Karty</Text>
      <Carousel
        ref={carouselRef}
        width={width * 0.75} 
        height={width * 1.1}
        data={cards}
        onProgressChange={progress}
        renderItem={renderCardItem}
        loop={false}
        pagingEnabled={true}
        snapEnabled={true}
        mode={"horizontal-stack"}
        modeConfig={{
          snapDirection: "left",
          stackInterval: 18,
        }}
        customConfig={() => ({ type: "positive", viewCount: 5 })}
      />
      <Pagination.Basic
        progress={progress} 
        data={cards}
        dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.75,
    height: width * 1.1,
  },
  cardImage: {
    width: 250,
    height: 220,
    marginBottom: 15,
  },
  Question: {
    width: 120,
    height: 120,
    marginBottom: 15,
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },  
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 4,
  },
  cardCount: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  textDisabled: {
    color: "#777",
  },
});

export default CardsScreen;
