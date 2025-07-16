import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

export const countryService = {
  async getAllCountries(page = 1, limit = 10) {
    try {
      const response = await api.get('/country', {
        params: {
          page,
          limit
        }
      })

      // Return the direct response structure
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages
      }
    } catch (error) {
      showApiError(error, "Failed to load countries");
      console.error('Error fetching countries:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch countries')
    }
  },

  async createCountry(countryData) {
    try {
      const response = await api.post('/country', countryData)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create country')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to create country");
      console.error('Error creating country:', error)
      throw new Error(error.response?.data?.message || 'Failed to create country')
    }
  },

  async updateCountry(countryId, data) {
    if (!countryId) {
      throw new Error('Country ID is required')
    }

    try {
      const response = await api.put(`/country?id=${countryId}`, data)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update country')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to update country");
      console.error('Error updating country:', error)
      throw new Error(error.response?.data?.message || 'Failed to update country')
    }
  },

  async deleteCountry(countryId) {
    if (!countryId) {
      throw new Error('Country ID is required')
    }

    try {
      const response = await api.delete(`/country?id=${countryId}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete country')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to delete country");
      console.error('Error deleting country:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete country')
    }
  }
} 