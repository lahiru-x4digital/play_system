import { showApiError } from '@/lib/apiErrorHandler';
import api from './api';

/**
 * Service for handling loyalty tier API operations
 */
export const loyaltyTierService = {
  /**
   * Get all loyalty tiers with optional filtering and pagination
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} Response with loyalty tiers data
   */
  getAllTiers: async (page = 1, limit = 10, searchParams = {}) => {
    try {
      const response = await api.get('/loyalty-tier', {
        params: {
          page,
          limit,
          ...searchParams
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch loyalty tiers');
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        pages: response.data.pages || 1,
        page: response.data.page || page
      };
    } catch (error) {
      showApiError(error, "Failed to fetch loyalty tiers");
      console.error('Error fetching loyalty tiers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty tiers');
    }
  },

  /**
   * Get a single loyalty tier by ID
   * @param {number} id - Loyalty tier ID
   * @returns {Promise<Object>} Response with loyalty tier data
   */
  getTierById: async (id) => {
    if (!id) {
      throw new Error('Tier ID is required');
    }

    try {
      const response = await api.get('/loyalty-tier', {
        params: { id }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch loyalty tier');
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch loyalty tier");
      console.error(`Error fetching loyalty tier with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty tier');
    }
  },

  /**
   * Create a new loyalty tier
   * @param {Object} tierData - Loyalty tier data
   * @returns {Promise<Object>} Response with created tier data
   */
  createTier: async (tierData) => {
    try {
      const response = await api.post('/loyalty-tier', tierData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create loyalty tier');
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to create loyalty tier");
      console.error('Error creating loyalty tier:', error);
      throw new Error(error.response?.data?.message || 'Failed to create loyalty tier');
    }
  },

  /**
   * Update an existing loyalty tier
   * @param {number} id - Loyalty tier ID
   * @param {Object} tierData - Updated loyalty tier data
   * @returns {Promise<Object>} Response with updated tier data
   */
  updateTier: async (id, tierData) => {
    if (!id) {
      throw new Error('Tier ID is required');
    }

    try {
      const response = await api.put('/loyalty-tier', tierData, {
        params: { id }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update loyalty tier');
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update loyalty tier");
      console.error(`Error updating loyalty tier with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update loyalty tier');
    }
  },

  /**
   * Delete a loyalty tier
   * @param {number} id - Loyalty tier ID
   * @returns {Promise<Object>} Response with deleted tier data
   */
  deleteTier: async (id) => {
    if (!id) {
      throw new Error('Tier ID is required');
    }

    try {
      const response = await api.delete('/loyalty-tier', {
        params: { id }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete loyalty tier');
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to delete loyalty tier");
      console.error(`Error deleting loyalty tier with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete loyalty tier');
    }
  }
};

export default loyaltyTierService;
