import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging - with limited logging
api.interceptors.request.use(
  (config) => {
    // Only log essential information and avoid logging large data objects
    if (process.env.NODE_ENV === "development") {
      // console.log("API Request:", {
      //   url: config.url,
      //   method: config.method,

      //   // Removed data and baseURL logging to prevent memory bloat
      // });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging - with limited logging
api.interceptors.response.use(
  (response) => {
    // Only log in development and avoid logging large response data
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        url: response.config.url,
        status: response.status,
        success: response.data?.success,
        // Avoid logging full response data to prevent memory bloat
      });
    }
    return response;
  },
  (error) => {
    // Don't log cancellation errors
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.message?.includes('canceled')) {
      return Promise.reject(error);
    }
    
    // Only log essential error information for non-cancellation errors
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        code: error.code
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
