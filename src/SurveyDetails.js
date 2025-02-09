import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from './../supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';


const SurveyDetails = ({ route }) => {
    const { surveyId, surveyTitle } = route.params;
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');

    useEffect(() => {
        const fetchQuestionsWithOptions = async () => {
            try {
                const { data: questionsData, error: questionsError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('survey_id', surveyId);

                if (questionsError) throw questionsError;

                if (questionsData && questionsData.length > 0) {
                    const questionsWithOptions = await Promise.all(
                        questionsData.map(async (question) => {
                            const { data: optionsData, error: optionsError } = await supabase
                                .from('options')
                                .select('content')
                                .eq('question_id', question.question_id);

                            if (optionsError) {
                                Alert.alert('Błąd', 'Nie udało się załadować opcji dla pytania: ' + optionsError.message);
                                return { ...question, options: [], newOption: '' };
                            } else {
                                return { ...question, options: optionsData.map(option => option.content), newOption: '' };
                            }
                        })
                    );

                    setQuestions(questionsWithOptions);
                } 
            } catch (error) {
                Alert.alert('Błąd', 'Nie udało się załadować danych: ' + error.message);
            }
        };

        fetchQuestionsWithOptions();
    }, [surveyId]);

    const handleAddQuestion = async () => {
        if (newQuestion.trim()) {
            const { data, error, status } = await supabase
                .from('questions')
                .insert([{ survey_id: surveyId, content: newQuestion.trim(), type: 'tex' }]);
    
            if (error) {
                Alert.alert('Błąd', 'Nie udało się dodać pytania: ' + error.message);
            } else {
                const { data: newQuestionData, error: fetchError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('survey_id', surveyId)
                    .eq('content', newQuestion.trim())
                    .single(); 
    
                if (fetchError) {
                    Alert.alert('Błąd', 'Nie udało się pobrać wstawionego pytania: ' + fetchError.message);
                } else {
                    console.log('New Question:', newQuestionData); 
                    setQuestions((prevQuestions) => [
                        ...prevQuestions,
                        { ...newQuestionData, options: [], newOption: '' }
                    ]);
                    setNewQuestion('');
                    Toast.show({
                        type: 'success', 
                        text1: 'Sukces!',
                        text2: 'Dodano pytanie!',
                        position: 'top',
                        visibilityTime: 4000,
                        text1Style: { fontSize: 22, fontWeight: 'bold' },
                        text2Style: { fontSize: 15 },
                    });                
                }
            }
        } else {
            Alert.alert('Błąd', 'Musisz wpisać pytanie.');
        }
    };
    
    const handleAddOption = async (questionId) => {
        const question = questions.find(q => q.question_id === questionId);
        if (question && question.newOption.trim()) {
            const { error } = await supabase
                .from('options')
                .insert([{ question_id: questionId, content: question.newOption.trim() }]);

            if (error) {
                Alert.alert('Błąd', 'Nie udało się dodać opcji: ' + error.message);
            } else {
                setQuestions(prevQuestions =>
                    prevQuestions.map(q =>
                        q.question_id === questionId ? { ...q, options: [...q.options, question.newOption.trim()], newOption: '' } : q
                    )
                );
            }
        }
    };

    const handleNewOptionChange = (text, questionId) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.question_id === questionId ? { ...q, newOption: text } : q
            )
        );
    };

    const handleToggleQuestionType = async (questionId) => {
        const questionTypes = ['tex', 'opt', 'sli', 'mul', 'rat', 'pic'];
        
        setQuestions(prevQuestions => 
            prevQuestions.map(q => {
                if (q.question_id === questionId) {
                    const newType = getNextQuestionType(q.type, questionTypes);
                    updateQuestionTypeInDatabase(questionId, newType);
                    return { ...q, type: newType }; 
                }
                return q;
            })
        );
    };
    
    const updateQuestionTypeInDatabase = async (questionId, newType) => {
        const { error } = await supabase
            .from('questions')
            .update({ type: newType })
            .eq('question_id', questionId);
    
        if (error) {
            Alert.alert('Błąd', 'Nie udało się zmienić typu pytania: ' + error.message);
        }
    };
    
    const getNextQuestionType = (currentType, typesArray) => {
        const currentIndex = typesArray.indexOf(currentType);
        const nextIndex = (currentIndex + 1) % typesArray.length;  
        return typesArray[nextIndex];
    };
    
    

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                    <Text style={styles.title}>{surveyTitle}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Wpisz nowe pytanie"
                        placeholderTextColor='#ddd'
                        value={newQuestion}
                        onChangeText={setNewQuestion}
                    />
                    <TouchableOpacity style={styles.shortButton} onPress={handleAddQuestion}>
                        <Text style={styles.buttonText}>Dodaj pytanie</Text>
                    </TouchableOpacity>

                    {questions.map((item) => (
                        <View key={item.question_id} style={styles.questionContainer}>
                            <Text style={styles.questionText}>{item.content}</Text>
                            <Text style={styles.optionsText}>Typ: {item.type}</Text>
                            <TouchableOpacity
                                style={styles.shortButton}
                                onPress={() => handleToggleQuestionType(item.question_id)}
                            >
                                <Text style={styles.buttonText}> Zmień typ </Text>
                            </TouchableOpacity>
                            <Text style={styles.optionsText}>Opcje: {item.options.join(', ')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Dodaj opcję"
                                placeholderTextColor='#ddd'
                                value={item.newOption}
                                onChangeText={(text) => handleNewOptionChange(text, item.question_id)}
                            />
                            <TouchableOpacity
                                style={styles.shortButton}
                                onPress={() => handleAddOption(item.question_id)}
                            >
                                <Text style={styles.buttonText}>Dodaj opcję</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'transparent' }, 
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        textAlign: 'center', 
        marginTop: 20, 
        color: 'white' 
    },
    questionContainer: { 
        marginBottom: 20, 
        marginTop: 20,
        padding: 10, 
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.2)', 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        borderRadius: 15
    },
    questionText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: 'white', 
        textAlign: 'center' 
    },
    optionsText: { 
        fontSize: 14, 
        color: '#ff9800', 
        textAlign: 'center' 
    },
    input: {
        marginTop: 10,
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: 'white' 
    },
    shortButton: {
        backgroundColor: '#ff9800',
        padding: 10,
        marginVertical: 5,
        alignItems: 'center',
        borderRadius: 5,
        width: '60%',
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});


export default SurveyDetails;
