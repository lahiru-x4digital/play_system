
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    // Add more default headers if needed
  },
  // withCredentials: true, // Uncomment if you want to send cookies (for auth)
});

// Optional: Add interceptors for auth, logging, etc.
// api.interceptors.request.use(config => {
//   // Modify config if needed (e.g., add auth token)
//   return config;
// });

export default api;