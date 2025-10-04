import axios from 'axios';
import { toast } from './components/Toaster'; // Make sure the path to your Toaster is correct

// Get the base URL from the environment variable.
// If it doesn't exist (local development), it falls back to '/api',
// which will be handled by your Vite proxy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Optional: Add error handling interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract a user-friendly error message
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred.';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default apiClient;