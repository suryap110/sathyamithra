import axios from 'axios';

// Update with host IP for Android physical device testing or localhost for emulator
const API_BASE_URL = 'http://10.0.2.2:8000';

export const mobileApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    mobileApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete mobileApiClient.defaults.headers.common['Authorization'];
  }
};
