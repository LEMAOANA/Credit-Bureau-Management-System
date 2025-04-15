import axios from 'axios';

export const setupAxiosInterceptors = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  axios.defaults.baseURL = 'http://localhost:5001'; // optional but clean
};
