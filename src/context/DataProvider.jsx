import React, { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/output.json') 
      .then((response) => response.json())
      .then((data) => setEvents(data));
  }, []);

  return (
    <DataContext.Provider value={{ events }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
