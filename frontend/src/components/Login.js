import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { initialized, currentUser, login } = useAuth(); // Added login here

  useEffect(() => {
    if (initialized && currentUser) {
      navigate('/Admin');
    }
  }, [initialized, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5001/api/auth/signin', {
        email,
        password
      });
  
      console.log('Login response:', response.data);
  
      const { status, token, data } = response.data;
      
      if (status !== "success" || !token || !data) {
        throw new Error('Invalid server response format');
      }
  
      const user = {
        id: data._id || data.id,
        email: data.email,
        // Include any additional user fields you need
        ...data
      };
  
      await login(user, token);
      navigate('/Admin');
      
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        // Handle HTML error responses
        if (typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
          errorMessage = 'Server error occurred';
        } else {
          errorMessage = err.response.data.message || JSON.stringify(err.response.data);
        }
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          
          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Logging in...
              </>
            ) : 'Login'}
          </button>

          <div className="links">
            <a href="/forgot-password">Forgot password?</a>
            <a href="/signup">Create new account</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;