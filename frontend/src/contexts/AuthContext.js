import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Safe storage functions
const safeSetStorage = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

const safeGetStorage = (key, isJson = true) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return isJson ? JSON.parse(item) : item;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    localStorage.removeItem(key);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => safeGetStorage('user'));
  const [token, setToken] = useState(() => safeGetStorage('token', false));
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Remove or modify token validation since endpoint doesn't exist
        // Alternatively, create this endpoint in your backend
        try {
          // Simple token presence check instead of validation
          if (!token) {
            throw new Error('No token found');
          }
          
          // If you want to add validation later, uncomment:
          // await axios.get('/api/auth/validate'); 
        } catch (error) {
          console.error('Token check failed:', error);
          // Don't logout on 404, only on actual auth errors
          if (error.response?.status !== 404) {
            logout();
          }
        }
      }
      setInitialized(true);
    };
  
    initializeAuth();
  }, [token]);

  const login = async (user, token) => {
    if (!safeSetStorage('user', user) || !safeSetStorage('token', token)) {
      throw new Error('Failed to save authentication data');
    }
    setCurrentUser(user);
    setToken(token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    safeSetStorage('user', null);
    safeSetStorage('token', null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    currentUser,
    token,
    initialized,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {initialized ? children : (
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading authentication...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};