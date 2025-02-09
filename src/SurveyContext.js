import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './../supabaseClient'; 
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
    const [surveys, setSurveys] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [points, setPoints] = useState(0);
    const [averageDailySurveys, setAverageDailySurveys] = useState(0);

   /* const fetchSurveys = async () => {
        try {
            const { data, error } = await supabase
                .from('surveys')
                .select('*')
                .eq('is_visible', true);
    
            if (error) throw error;
            setSurveys(data);  // Aktualizowanie stanu surveys
        } catch (error) {
            console.error('Error fetching surveys:', error);
        }
    };
    
    useEffect(
        fetchSurveys()
    ); */
    

  /*  const incrementPoints = async (amount) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ points: currentUser.points + amount })
                .eq('login', currentUser.login); 

            if (error) throw error; 

            setPoints((prevPoints) => prevPoints + amount);
        } catch (error) {
            console.error('Error updating points:', error.message);
            throw error; 
        }
    }; */

    const addSurvey = async (title, questions) => {
        try {
            const { data, error } = await supabase
                .from('surveys') 
                .insert([{ title }])
                .select()
                .single(); 
    
            if (error) throw error; 
    
            setSurveys(prevSurveys => [...prevSurveys, data]);
        } catch (error) {
            console.error('Error adding survey:', error);
        }
    };
    

    const addQuestionToSurvey = async (surveyId, question) => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .insert([{ survey_id: surveyId, ...question }]) 
                .select()
                .single(); 
    
            if (error) throw error; 
    
            setSurveys(prevSurveys => 
                prevSurveys.map(survey => {
                    if (survey.id === surveyId) {
                        return {
                            ...survey,
                            questions: [...survey.questions, data], 
                        };
                    }
                    return survey;
                })
            );
        } catch (error) {
            console.error('Error adding question:', error.message); 
        }
    };
    

    const submitSurveyResponses = async (surveyId, responses) => {
        if (!Array.isArray(responses) || responses.length === 0) {
            throw new Error('Responses must be a non-empty array');
        }
    
        const preparedResponses = [];
    
        responses.forEach(response => {
            if (Array.isArray(response.response)) {
                response.response.forEach(option => {
                    preparedResponses.push({
                        survey_id: surveyId,
                        user_id: currentUser ? currentUser.user_id : null, 
                        question_id: response.question_id,
                        response: option,  
                    });
                });
            } else {
                preparedResponses.push({
                    survey_id: surveyId,
                    user_id: currentUser ? currentUser.user_id : null,
                    question_id: response.question_id,
                    response: response.response,
                });
            }
        });
    
        const { data, error } = await supabase
            .from('responses')
            .insert(preparedResponses);
    
        if (error) {
            throw error;  
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
            console.log(average);
            setAverageDailySurveys(average);
        } catch (error) {
            console.error('Błąd podczas pobierania średniej dziennej liczby ankiet:', error.message);
        }
    };

    const loginUser = async (username, password) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('login', username)
                .eq('password', password)
                .single();
    
            if (error) {
                throw error;
            }
    
            if (data) {
                setCurrentUser({
                    user_id: data.ID,
                    login: data.login,
                    points: data.points,
                });
            }
        } catch (error) {
            console.error('Błąd logowania:', error.message);
            throw error; 
        }
    };
    
    

    return (
        <SurveyContext.Provider value={{ 
            surveys, 
            addSurvey, 
            addQuestionToSurvey, 
            submitSurveyResponses, 
            currentUser, 
            setCurrentUser, 
            loginUser,
            points, 
            averageDailySurveys, 
            setAverageDailySurveys,
            fetchAverageDailySurveys,
        }}>
            {children}
        </SurveyContext.Provider>
    );
};

export const useSurveyContext = () => useContext(SurveyContext);  
