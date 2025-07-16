import { showApiError } from '@/lib/apiErrorHandler';
import api from './api';
import { format } from 'date-fns';

export const customerAnalyticsService = {
  async getCustomerAnalytics(startDate, endDate, timeRange, country, brand, branch) {
    try {

      // Make the real API call
      const response = await api.get('/customer/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate,
          time_range: timeRange,
          ...(country && { country: country }),
          ...(brand && { brand: brand }),
          ...(branch && { branch: branch })
        }
      });

      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        console.warn('API response missing success flag or data');
        return {
          success: false,
          error: 'Invalid API response structure',
          data: null
        };
      }

      // Ensure the response has the expected structure
      const data = response.data.data || response.data;

      // If the API response doesn't have time_series, try to construct it from available data
      if (!data.time_series) {
        console.warn('API response missing time_series, constructing from available data');

        // Try to create time series from other available data
        if (data.customers || data.new_customers) {
          const timeSeries = this.constructTimeSeriesFromData(data, startDate, endDate, timeRange);
          data.time_series = timeSeries;
        } else {
          // Return error if we can't construct time series
          return {
            success: false,
            error: 'Unable to construct time series from available data',
            data: null
          };
        }
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Get customer analytics error:', error);
      showApiError(error, "Failed to get customer analytics");

      // Return error response instead of mock data
      return {
        success: false,
        error: error.message || 'Failed to fetch customer analytics',
        data: null
      };
    }
  },

  // Helper method to construct time series from available data
  constructTimeSeriesFromData(data, startDate, endDate, timeRange) {
    // This is a fallback method in case the API doesn't return time_series
    // You can implement this based on your API response structure
    console.warn('Constructing time series from available data - implement based on your API structure');
    return [];
  }
};
