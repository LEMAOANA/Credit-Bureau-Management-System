// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password
  });

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data;
};

export default { login };
