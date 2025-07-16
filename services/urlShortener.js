import api from './api'

/**
 * Shortens a URL using the URL shortener service
 * @param {string} originalUrl - The URL to be shortened
 * @returns {Promise<string>} The shortened URL
 * @throws {Error} If the URL shortening fails
 */
export const shortenUrl = async (originalUrl) => {
  try {
    const response = await api.post('/shorten-url', { url: originalUrl });
    
    // Assuming the API returns an object with a shortUrl property
    if (response.data && response.data.shortUrl) {
      return response.data.shortUrl;
    }
    
    // If the response format is different, try to handle it
    if (response.data && typeof response.data === 'string') {
      return response.data;
    }
    
    throw new Error('Invalid response format from URL shortener service');
  } catch (error) {
    console.error('URL shortening error:', error);
    
    // Extract error message from response if available
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to shorten URL';
    
    throw new Error(errorMessage);
  }
};

