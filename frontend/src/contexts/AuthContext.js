// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '../services/authService'; // make sure authService is properly defined

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || null,
  });

  useEffect(() => {
    if (authState.token) {
      localStorage.setItem('token', authState.token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [authState.token]);

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      if (data.status === 'success') {
        const { token, user } = data;
        setAuthState({ token, user });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = () => {
    setAuthState({ token: '', user: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
