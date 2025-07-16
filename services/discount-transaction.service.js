import { showApiError } from '@/lib/apiErrorHandler'
import api from './api'

export const discountTransactionService = {
  async getDiscountTransactions() {
    try {
      const response = await api.get('/discount-transaction')
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get discount transactions");

      console.error('Get discount transactions error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch discount transactions')
    }
  },

  async searchTransactionsByMobile(mobileNumber, page = 1, limit = 10) {
    try {
      const response = await api.get(
        `/search?type=transaction&searchBy=mobile&value=${encodeURIComponent(mobileNumber)}&page=${page}&limit=${limit}`
      )
      return response.data
    } catch (error) {
            showApiError(error, "Failed to search transactions");
      
      console.error('Search transactions error:', error)
      throw new Error(error.response?.data?.message || 'Failed to search transactions')
    }
  }
} 