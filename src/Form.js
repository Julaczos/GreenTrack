import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { useSurveyContext } from './SurveyContext';

const Form = ({ route, navigation }) => {
    const { surveyId } = route.params; 
    const { surveys } = useSurveyContext(); 

    const survey = surveys.find(s => s.id === surveyId);

    const [answers, setAnswers] = useState(Array(survey.questions.length).fill(''));

    const handleAnswerChange = (text, index) => {
        const newAnswers = [...answers];
        newAnswers[index] = text;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        navigation.navigate('Summary', { answers, surveyId });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{survey.title}</Text>
            <FlatList
                data={survey.questions}
                renderItem={({ item, index }) => (
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionText}>{item}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Twoja odpowiedź"
                            value={answers[index]}
                            onChangeText={(text) => handleAnswerChange(text, index)}
                        />
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
            <Button title="Prześlij odpowiedzi" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    questionContainer: { marginBottom: 20 },
    questionText: { fontSize: 18, marginBottom: 5 },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingLeft: 10,
        borderRadius: 5,
    }
});

export default Form;
