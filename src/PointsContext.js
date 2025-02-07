import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
    const [points, setPoints] = useState(0); 

    const addPoints = (newPoints) => {
        if (typeof newPoints === 'number') {
            setPoints((prevPoints) => prevPoints + newPoints);
        } else {
            console.warn('Dodawana wartość punktów nie jest liczbą:', newPoints);
        }
    };

    const contextValue = {
        points,
        addPoints,
    };

    return (
        <PointsContext.Provider value={contextValue}>
            {children}
        </PointsContext.Provider>
    );
};

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) {
        throw new Error('usePoints must be used within a PointsProvider');
    }
    return context;
};
