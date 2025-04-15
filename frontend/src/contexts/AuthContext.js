// contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = (userData, token) => {
    setCurrentUser(userData);
    setToken(token);
    localStorage.setItem('token', token); // Optional: store token for persistence
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
