import api from './api';
import { format } from 'date-fns';

export const cancelledReservationReportService = {
  // Private method for making API calls to avoid code duplication
  async _fetchCancelledReservationReport(startDate, endDate, filters = {}, pagination = {}) {
    try {
      // Build params object, only including non-null values
      const params = {
        start_date: startDate,
        end_date: endDate
      };

      // Add pagination parameters
      if (pagination.page) params.page = pagination.page;
      if (pagination.limit) params.limit = pagination.limit;

      // Add filters based on what's provided
      if (filters.countryId) params.country_id = filters.countryId;
      if (filters.brandId) params.brand_id = filters.brandId;
      if (filters.branchId) params.branch_id = filters.branchId;

      console.log('Fetching cancelled reservation report with params:', params);

      // Make the API call
      const response = await api.get('/booking/reservations/cancelled-report', { params });

      // console.log('Cancelled Reservation API Response:', response.data);

      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        console.warn('API response missing success flag or data, returning empty result');
        return { 
          success: false, 
          data: { 
            cancelled_reservations: [], 
            summary: {}, 
            date_range: {},
            applied_filters: filters
          },
          total: 0,
          page: 1,
          pages: 1
        };
      }

      return {
        success: true,
        data: {
          ...response.data.data,
          applied_filters: filters
        },
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };

    } catch (error) {
      console.error('Get cancelled reservation report error:', error);
      
      // Return empty result as fallback
      return { 
        success: false, 
        data: { 
          cancelled_reservations: [], 
          summary: {}, 
          date_range: {},
          applied_filters: filters
        },
        total: 0,
        page: 1,
        pages: 1
      };
    }
  },

  // Standard method - maintains backward compatibility
  async getCancelledReservationReport(startDate, endDate, countryId, brandId, branchId, pagination = {}) {
    const filters = {};
    if (countryId) filters.countryId = countryId;
    if (brandId) filters.brandId = brandId;
    if (branchId) filters.branchId = branchId;

    return this._fetchCancelledReservationReport(startDate, endDate, filters, pagination);
  },

  // Real-time method - takes filters object
  async getCancelledReservationReportRealtime(startDate, endDate, filters = {}, pagination = {}) {
    return this._fetchCancelledReservationReport(startDate, endDate, filters, pagination);
  },

  formatDateForAPI(date) {
    return format(new Date(date), 'yyyy-MM-dd');
  },
};
