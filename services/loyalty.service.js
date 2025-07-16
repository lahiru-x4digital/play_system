import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

export const loyaltyService = {
  // Earning Rules
  async getEarningRules({ page = 1, limit = 10, skip = 0, filters = {} } = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
      });

      // Text search filters
      if (filters.name) {
        params.append('name', filters.name);
      }

      // Reference ID filters
      if (filters.country_id) {
        params.append('country_id', filters.country_id);
      }
      
      if (filters.brand_id) {
        params.append('brand_id', filters.brand_id);
      }

      // Active status filter
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString());
      }

      const response = await api.get(`/loyalty-earning-rule?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch earning rules");
      console.error('Get earning rules error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch earning rules');
    }
  },

  async createEarningRule(data) {
    try {
      console.log('loyalty.service received data:', data)
      
      // Ensure data is properly formatted before sending
      const cleanData = {
        name: data.name,
        description: data.description,
        country_id: Number(data.country_id),
        brand_id: Number(data.brand_id),
        is_active: Boolean(data.is_active !== undefined ? data.is_active : true),
      }

      console.log('Sending cleaned data to API:', cleanData)
      const response = await api.post('/loyalty-earning-rule', cleanData)
      
      return response.data
    } catch (error) {
      showApiError(error, "Failed to create earning rule");
      console.error('Create earning rule service error:', {
        error,
        message: error.message,
        response: error.response,
        responseData: error.response?.data
      })
      throw error
    }
  },

  async updateEarningRule(id, data) {
    try {
      console.log(`Updating earning rule ${id} with data:`, data)
      
      // Ensure data is properly formatted before sending
      const cleanData = {}
      
      if (data.name !== undefined) cleanData.name = data.name
      if (data.description !== undefined) cleanData.description = data.description
      if (data.country_id !== undefined) cleanData.country_id = Number(data.country_id)
      if (data.brand_id !== undefined) cleanData.brand_id = Number(data.brand_id)
      if (data.is_active !== undefined) cleanData.is_active = Boolean(data.is_active)

      console.log('Sending cleaned data to API:', cleanData)
      const response = await api.put(`/loyalty-earning-rule?id=${id}`, cleanData)
      
      return response.data
    } catch (error) {
      showApiError(error, "Failed to update earning rule");
      console.error('Update earning rule service error:', {
        error,
        message: error.message,
        response: error.response,
        responseData: error.response?.data
      })
      throw error
    }
  },

  async deleteEarningRule(id) {
    try {
      const response = await api.delete(`/loyalty-earning-rule?id=${id}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to delete earning rule");
      console.error('Delete earning rule service error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete earning rule')
    }
  },

  async getLoyaltyLevels({ earning_rule_id, page = 1, limit = 10, skip = 0 } = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
      });

      if (earning_rule_id) {
        params.append('earning_rule_id', earning_rule_id);
      }

      const response = await api.get(`/loyalty-level?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch loyalty levels");
      console.error('Get loyalty levels error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty levels');
    }
  },

  // Loyalty Tiers
  async getLoyaltyTiers({ page = 1, limit = 10, skip = 0, filters = {} } = {}) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
      });

      if (filters.tier_name) {
        params.append('tier_name', filters.tier_name);
      }

      if (filters.country_id) {
        params.append('country_id', filters.country_id);
      }
      
      if (filters.brand_id) {
        params.append('brand_id', filters.brand_id);
      }

      const response = await api.get(`/loyalty-tier?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch loyalty tiers");
      console.error('Get loyalty tiers error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty tiers');
    }
  },

  // Point batches and redemptions
  async getPointBatches({ customer_id, page = 1, limit = 10, skip = 0 } = {}) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
      });

      if (customer_id) {
        params.append('customer_id', customer_id);
      }

      const response = await api.get(`/point-batch?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch point batches");
      console.error('Get point batches error:', error);
      throw new Error(error.response?.data?.message || 'Fai led to fetch point batches');
    }
  },

  async getRedemptionRules({ page = 1, limit = 10, skip = 0, filters = {} } = {}) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
      });

      if (filters.name) {
        params.append('name', filters.name);
      }

      if (filters.redemption_type) {
        params.append('redemption_type', filters.redemption_type);
      }

      if (filters.country_id) {
        params.append('country_id', filters.country_id);
      }
      
      if (filters.brand_id) {
        params.append('brand_id', filters.brand_id);
      }

      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString());
      }

      if (filters.currently_valid !== undefined) {
        params.append('currently_valid', filters.currently_valid.toString());
      }

      const response = await api.get(`/loyalty-redemption-rule?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch redemption rules");
      console.error('Get redemption rules error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch redemption rules');
    }
  },

  async createRedemptionRule(data) {
    try {
      console.log('loyalty.service received redemption rule data:', data)
      
      // Ensure data is properly formatted before sending
      const cleanData = {
        name: data.name,
        point_to_cash_value: parseFloat(data.point_to_cash_value),
        is_active: Boolean(data.is_active !== undefined ? data.is_active : true),
      }

      // Add optional fields if present
      if (data.redemption_type && data.redemption_type !== 'none') cleanData.redemption_type = data.redemption_type
      if (data.points_required !== undefined) cleanData.points_required = parseInt(data.points_required)
      if (data.value !== undefined) cleanData.value = parseFloat(data.value)
      if (data.country_id && data.country_id !== 'none') cleanData.country_id = parseInt(data.country_id)
      if (data.brand_id && data.brand_id !== 'none') cleanData.brand_id = parseInt(data.brand_id)

      console.log('Sending cleaned redemption rule data to API:', cleanData)
      const response = await api.post('/loyalty-redemption-rule', cleanData)
      
      return response.data
    } catch (error) {
      showApiError(error, "Failed to create redemption rule");
      console.error('Create redemption rule service error:', {
        error,
        message: error.message,
        response: error.response,
        responseData: error.response?.data
      })
      throw error
    }
  },

  async updateRedemptionRule(id, data) {
    try {
      console.log(`Updating redemption rule ${id} with data:`, data)
      
      // Ensure data is properly formatted before sending
      const cleanData = {}
      
      if (data.name !== undefined) cleanData.name = data.name
      if (data.point_to_cash_value !== undefined) cleanData.point_to_cash_value = parseFloat(data.point_to_cash_value)
      if (data.redemption_type !== undefined) {
        cleanData.redemption_type = data.redemption_type === 'none' ? null : data.redemption_type
      }
      if (data.points_required !== undefined) cleanData.points_required = data.points_required !== "" ? parseInt(data.points_required) : null
      if (data.value !== undefined) cleanData.value = data.value !== "" ? parseFloat(data.value) : null
      if (data.country_id !== undefined) {
        cleanData.country_id = data.country_id === 'none' ? null : parseInt(data.country_id)
      }
      if (data.brand_id !== undefined) {
        cleanData.brand_id = data.brand_id === 'none' ? null : parseInt(data.brand_id)
      }
      if (data.is_active !== undefined) cleanData.is_active = Boolean(data.is_active)

      console.log('Sending cleaned data to API:', cleanData)
      const response = await api.put(`/loyalty-redemption-rule?id=${id}`, cleanData)
      
      return response.data
    } catch (error) {
      showApiError(error, "Failed to update redemption rule");
      console.error('Update redemption rule service error:', {
        error,
        message: error.message,
        response: error.response,
        responseData: error.response?.data
      })
      throw error
    }
  },

  async deleteRedemptionRule(id) {
    try {
      const response = await api.delete(`/loyalty-redemption-rule?id=${id}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to delete redemption rule");
      console.error('Delete redemption rule service error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete redemption rule')
    }
  }
}
