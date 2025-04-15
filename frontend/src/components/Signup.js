import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setMessage("Passwords don't match.");
      return;
    }
    try {
      await axios.post('http://localhost:5001/api/auth/signup', {
        username,
        email,
        password,
        passwordConfirm
      });
      setMessage('Signup successful! Please log in.');
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setMessage('Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create an Account</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
        {message && <p>{message}</p>}

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
