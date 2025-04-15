import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the updated Login.css
import { useAuth } from '../contexts/AuthContext';
import { setupAxiosInterceptors } from '../utils/setupAxios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/auth/signin', {
        email,
        password,
      });

      const { user, token } = response.data;

      // Set the token globally for Axios
      setupAxiosInterceptors(token);

      // Save user and token in context
      login(user, token);

      // Optionally save token to localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to users page or homepage
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setMessage('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <button type="submit">Login</button>
          </div>

          {message && <p className="error-message">{message}</p>}

          <div className="links">
            <p><a href="/forgot-password">Forgot Password?</a></p>
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
