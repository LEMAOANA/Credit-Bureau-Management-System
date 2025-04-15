// services/authService.js
import axios from 'axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email,
      password,
    });

    // Assuming the backend returns the user data and token
    const { token, data } = response.data;

    // Store the token in localStorage
    localStorage.setItem('token', token);

    // Return the user data
    return data.user;
  } catch (error) {
    // Handle error
    throw new Error(error.response ? error.response.data : error.message);
  }
};
