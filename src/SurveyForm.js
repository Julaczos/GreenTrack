import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useSurveyContext } from './SurveyContext';
import { supabase } from './../supabaseClient';

const SurveyForm = ({ route, navigation }) => {
    const { surveyId } = route.params || {};
    const { submitSurveyResponses } = useSurveyContext();
    
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]); 
    const [answers, setAnswers] = useState([]); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    
    const progress = new Animated.Value((currentQuestionIndex + 1) / questions.length);

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const { data: surveyData, error: surveyError } = await supabase
                    .from('surveys')
                    .select('*')
                    .eq('survey_id', surveyId)
                    .single();

                if (surveyError) throw surveyError;

                setSurvey(surveyData);

                const { data: questionsData, error: questionsError } = await supabase
                    .from('questions')
                    .select('*, options(*), image_url, type')
                    .eq('survey_id', surveyId);

                if (questionsError) throw questionsError;

                setQuestions(questionsData);
                setAnswers(Array(questionsData.length).fill(''));
            } catch (error) {
                Alert.alert('Błąd', 'Nie udało się pobrać ankiety lub pytań: ' + error.message);
                console.error(error);
            }
        };

        fetchSurvey();
    }, [surveyId]);

    useEffect(() => {
        Animated.timing(progress, {
            toValue: (currentQuestionIndex + 1) / questions.length,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [currentQuestionIndex]);

    const handleAnswerChange = (answer) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = answer;
        setAnswers(updatedAnswers);
    };

    const handleCheckboxChange = (selectedOption) => {
        // Create a copy of the current answers
        const updatedAnswers = [...answers];
    
        // Get the current answer for the current question (if any)
        const currentAnswer = updatedAnswers[currentQuestionIndex] || [];
    
        // Toggle the selected option in the answers array
        if (currentAnswer.includes(selectedOption)) {
            // Remove the option if it is already selected
            const index = currentAnswer.indexOf(selectedOption);
            if (index > -1) {
                currentAnswer.splice(index, 1);
            }
        } else {
            // Add the option if it's not already selected
            currentAnswer.push(selectedOption);
        }
    
        // Update the answers array for the current question
        updatedAnswers[currentQuestionIndex] = currentAnswer;
        setAnswers(updatedAnswers);
    };
    

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const preparedResponses = questions.map((question, index) => ({
                question_id: question.question_id,
                response: answers[index], 
            })).filter(response => response.response !== ''); 

            if (preparedResponses.length === 0) {
                throw new Error('Brak odpowiedzi do zapisania.');
            }

            await submitSurveyResponses(surveyId, preparedResponses);
            navigation.navigate('Summary', { answers, surveyId });
        } catch (error) {
            console.error('Błąd podczas zapisywania:', error);
            Alert.alert('Błąd', error.message);
        }
    };

    if (!survey || questions.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Ładowanie ankiety...</Text>
            </View>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
            <View style={styles.container}>
                <Text style={styles.headerTitle}>{survey.title}</Text>

                <View style={styles.progressBarContainer}>
                    <Animated.View style={[styles.progressBar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                </View>

                <View style={styles.questionContainer}>
                    {currentQuestion && (
                        <View style={styles.questionCard}>
                            <Text style={styles.question}>{currentQuestion.content}</Text>
                            {currentQuestion.image_url && (
                                <Image source={{ uri: currentQuestion.image_url }} style={styles.image} />
                            )}
                        </View>
                    )}

                    {currentQuestion.type === 'opt' && currentQuestion.options && (
                        currentQuestion.options.map((item) => (
                            <TouchableOpacity
                                key={item.options_id}
                                style={[styles.option, answers[currentQuestionIndex] === item.content && styles.selectedOption]}
                                onPress={() => handleAnswerChange(item.content)}
                            >
                                <Text style={styles.optionText}>{item.content}</Text>
                            </TouchableOpacity>
                        ))
                    )}

                    {currentQuestion.type === 'mul' && currentQuestion.options && (
                        currentQuestion.options.map((item) => (
                            <TouchableOpacity
                                key={item.options_id}
                                style={[styles.option, (answers[currentQuestionIndex] || []).includes(item.content) && styles.selectedOption]}
                                onPress={() => handleCheckboxChange(item.content)}
                            >
                                <Text style={styles.optionText}>{item.content}</Text>
                            </TouchableOpacity>
                        ))
                    )}

                    {currentQuestion.type === 'rat' && (
                        <View style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => handleAnswerChange(star)}
                                >
                                    <Text style={[styles.star, answers[currentQuestionIndex] >= star && styles.filledStar]}>★</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {currentQuestion.type === 'sli' && (
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderValue}>{answers[currentQuestionIndex] || 50}</Text>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={answers[currentQuestionIndex] || 50}
                                onValueChange={handleAnswerChange}
                                minimumTrackTintColor="#ff9800"
                                maximumTrackTintColor="#ccc"
                                thumbTintColor="#ff9800"
                            />
                        </View>
                    )}

                    {currentQuestion.type === 'tex' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Wpisz swoją odpowiedź..."
                            onChangeText={handleAnswerChange}
                            value={answers[currentQuestionIndex]}
                            placeholderTextColor="#aaa"
                        />
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleBack} disabled={currentQuestionIndex === 0} style={[styles.button, currentQuestionIndex === 0 && styles.disabledButton]}>
                        <Text style={styles.buttonText}>Wróć</Text>
                    </TouchableOpacity>
                    {currentQuestionIndex < questions.length - 1 ? (
                        <TouchableOpacity onPress={handleNext} disabled={!answers[currentQuestionIndex]} style={[styles.button, !answers[currentQuestionIndex] && styles.disabledButton]}>
                            <Text style={styles.buttonText}>Dalej</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleSubmit} disabled={!answers[currentQuestionIndex]} style={[styles.button, !answers[currentQuestionIndex] && styles.disabledButton]}>
                            <Text style={styles.buttonText}>Zakończ</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    headerTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: 20 },
    progressBarContainer: { height: 10, width: '100%', backgroundColor: '#ddd', borderRadius: 5, overflow: 'hidden', marginBottom: 20 },
    progressBar: { height: '100%', backgroundColor: '#ff9800' },
    questionContainer: { alignItems: 'center' },
    questionCard: { backgroundColor: '#ff9800', padding: 15, borderRadius: 10, width: '100%', marginBottom: 20 },
    question: { fontSize: 22, textAlign: 'center', fontWeight: 'bold', color: '#333' },
    image: { width: '100%', height: 200, resizeMode: 'contain', marginTop: 10, borderRadius: 10 },
    option: { padding: 10, marginVertical: 5, borderWidth: 1, borderColor: '#ccc', Color: 'white', backgroundColor:'rgb(164, 164, 164)', borderRadius: 5, width: '100%', alignItems: 'center', },
    selectedOption: { backgroundColor: '#ff9800', },
    optionText: { fontSize: 18, color: 'ff9800', },
    input: { height: 45, width: '100%', borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 15, borderRadius: 10, marginTop: 10, backgroundColor: 'white', fontSize: 16 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    button: { backgroundColor: '#ff9800', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5 },
    disabledButton: { backgroundColor: '#ccc' },
    buttonText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
    sliderContainer: { width: '100%', alignItems: 'center' },
    sliderValue: { fontSize: 18, color: 'white', marginBottom: 10 },
    ratingContainer: { flexDirection: 'row' },
    star: { fontSize: 30, color: '#ccc' },
    filledStar: { color: '#ff9800' },
});

export default SurveyForm;
