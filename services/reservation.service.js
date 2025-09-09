import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

// Add subscription source for reservations with optimized polling
export const reservationSubscription = (branchId) => {
  return {
    subscribe: (callback) => {
      if (!branchId) {
        console.warn('No branchId provided to reservationSubscription');
        return () => { }; // Return empty cleanup function
      }

      const controller = new AbortController();
      const { signal } = controller;

      // Track last data hash to avoid unnecessary re-renders
      let lastDataHash = null;

      // Set up polling interval outside of the async function
      let interval;
      let isPolling = false;

      // Initial fetch function
      const fetchData = async () => {
        if (signal.aborted || isPolling) return;

        isPolling = true;

        try {
          const response = await api.get('/booking/reservations', {
            params: { branch_id: branchId },
            signal
          });

          if (response.data.success) {
            // Only trigger callback if data has changed
            const currentHash = JSON.stringify(response.data.data);
            if (currentHash !== lastDataHash) {
              lastDataHash = currentHash;
              callback(null, response.data);
            }
          }
        } catch (error) {
          if (!signal.aborted) {
            // Only log critical errors, not aborted requests
            if (error.name !== 'AbortError') {
              console.error('Reservation fetch error:', error.message);
              showApiError(error, "Failed to fetch reservations");
              callback(error, null);
            }
          }
        } finally {
          isPolling = false;
        }
      };

      // Start initial fetch
      fetchData();

      // Set up polling with a longer interval (10 seconds instead of 5)
      interval = setInterval(fetchData, 10000);

      // Always return an unsubscribe function
      return () => {
        clearInterval(interval);
        controller.abort();
      };
    }
  };
};

export const reservationService = {
  /**
   * Create a new reservation
   */
  async createReservation(data) {
    try {
      const response = await api.post('/booking/reservations', data)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to create reservation");
      console.error('Create reservation error:', error)
      console.error('Error response:', error.response)
      throw new Error(error.response?.data?.message || 'Failed to create reservation')
    }
  },

  /**
   * Get all reservations with optional filters
   */
  async getAllReservations(params = {}) {
    try {
      // Use a large limit if not specified to ensure all records are fetched
      const effectiveLimit = params.limit ? parseInt(params.limit) : 10000000000;

      // Ensure pagination parameters are properly formatted
      const formattedParams = {
        ...params,
        page: parseInt(params.page) || 1,
        limit: effectiveLimit,
        skip: params.skip !== undefined ? parseInt(params.skip) : ((parseInt(params.page) || 1) - 1) * effectiveLimit
      };

      // console.log('Fetching reservations with params:', formattedParams);

      const response = await api.get('/booking/reservations', { params: formattedParams })
      return response.data
    } catch (error) {
      showApiError(error, "Failed to fetch reservations");
      console.error('Get reservations error:', error)
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch reservations')
      } else if (error.request) {
        throw new Error('Network error - no response received')
      } else {
        throw new Error('Failed to send request')
      }
    }
  },

  /**
   * Get reservation by ID
   */
  async getReservationById(id) {
    try {
      const response = await api.get(`/booking/reservations`, {
        params: { id }
      })
      return response.data
    } catch (error) {
      showApiError(error, "Failed to fetch reservation");
      console.error('Get reservation error:', error)
      if (error.response) {
        console.error('Server responded with error:', error.response.data)
        throw new Error(error.response.data.message || 'Failed to fetch reservation')
      } else if (error.request) {
        console.error('No response received:', error.request)
        throw new Error('Network error - no response received')
      } else {
        console.error('Error setting up request:', error.message)
        throw new Error('Failed to send request')
      }
    }
  },

  /**
   * Update reservation status
   */
  async updateReservationStatus(id, status) {
    console.log('Updating reservation status:', { id, status });
    try {
      // Use the general update endpoint with PUT method and ID as query parameter
      const response = await api.put(`/booking/reservations?id=${id}`, {
        reservationStatus: status
      });
      console.log('Update response:', response);
      return response.data;
    } catch (error) {
      console.error('Update reservation status error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      showApiError(error, "Failed to update reservation status");
      throw new Error(error.response?.data?.message || 'Failed to update reservation status');
    }
  },

  /**
   * Update a reservation
   * @param {string|number} id - The ID of the reservation to update
   * @param {Object} data - The data to update
   */
  async updateReservation(id, data) {
    console.log(`[EntityDetailsDialog] Updating notes for	${id}`)
    try {
      const response = await api.put('/booking/reservations', {
        ...data,
        table_ids: data.table_ids,
      }, {
        params: { id }
      })
      return response.data
    } catch (error) {
      showApiError(error, "Failed to update reservation");
      if (error.response) {
        console.error('Server responded with error:', error.response.data)
        throw new Error(error.response.data.message || 'Failed to update reservation')
      } else if (error.request) {
        console.error('No response received:', error.request)
        throw new Error('Network error - no response received')
      } else {
        console.error('Error setting up request:', error.message)
        throw new Error('Failed to send update request')
      }
    }
  },

  /**
   * Delete a reservation
   */
  async deleteReservation(id) {
    try {
      const response = await api.delete(`/booking/reservations?id=${id}`);
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to delete reservation");
      console.error('Delete reservation error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete reservation');
    }
  },

  /**
   * Send confirmation email
   */
  async sendConfirmationEmailSomewhere(data) {
    const response = await api.post('/send-email-somewhere', data)
    return response.data
  },

  async sendConfirmationEmailParkers(data) {
    const response = await api.post('/send-email-parkers', data)
    return response.data
  },

  async sendConfirmationEmailKumo(data) {
    const response = await api.post('/send-email-kumo', data)
    return response.data
  },

  async sendConfirmationEmailPublic(data) {
    const response = await api.post('/send-email-public', data)
    return response.data
  },

  async sendConfirmationEmail(data) {
    const response = await api.post('/send-email', data)
    return response.data
  },

  /**
   * Get reservations by branch ID
   */
  async getReservationsByBranch(branchId) {
    try {
      // Use a large limit to ensure all reservations are fetched
      const response = await api.get('/booking/reservations', {
        params: {
          branch_id: branchId,
          limit: 10000000000 // Very large limit to get all reservation items
        }
      });

      // console.log(`Fetched ${response.data.data?.length || 0} reservations for branch ${branchId}`);
      return {
        success: true,
        data: response.data.data || []
      }
    } catch (error) {
      showApiError(error, "Failed to fetch reservations by branch");
      console.error('Get reservations by branch error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reservations'
      }
    }
  },

  /**
   * Search reservations by query string (searches across all reservations)
   * @param {string} query - The search query
   * @param {Object} params - Additional parameters like branch_id
   */
  async searchReservations(query, params = {}) {
    try {
      // Check if query looks like a mobile number or reservation ID
      const isMobileNumber = /^\d{10,12}$/.test(query.replace(/[\s-]/g, ''));
      const isReservationId = /^RES\d{6}$/.test(query);

      // Build search parameters based on query type
      const searchParams = {
        ...params,
        limit: null // Reasonable limit for search results
      };

      // Add appropriate search parameter based on query type
      if (isMobileNumber) {
        searchParams.customer_mobile_number = query.replace(/[\s-]/g, '');
      } else if (isReservationId) {
        searchParams.reservation_id = query;
      } else {
        // For other queries, we'll search by reservation_id as partial match
        // Note: Your API might need to be updated to support partial matching
        searchParams.reservation_id = query;
      }

      // console.log('Searching reservations with params:', searchParams);

      const response = await api.get('/booking/reservations', { params: searchParams });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          total: response.data.total || 0,
          pages: response.data.pages || 1,
          page: response.data.page || 1
        };
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error) {
      showApiError(error, "Failed to search reservations");
      console.error('Search reservations error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search reservations',
        data: []
      };
    }
  },

  async downloadReservationCsv() {
    // Set responseType to 'blob' to handle file download
    const response = await api.get(`/booking/reservations/download`, {
      responseType: 'blob'
    })

    // Create a URL for the blob and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reservations.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    return {
      success: true,
      message: 'CSV file downloaded successfully'
    }
  },

  /**
   * Get all reservations without pagination
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Array>} - Array of all matching reservations
   */
  async getAllReservationsWithoutPagination(params = {}) {
    try {
      // Remove pagination parameters
      const { page, limit, skip, ...filters } = params;

      // Add status and payment_status filters if not provided
      const queryParams = {
        ...filters,
        // reservationStatus: 'CONFIRMED',
        payment_status: 'PAID'
      };

      // console.log('Fetching all reservations with filters:', queryParams);

      // First, get the total count to know how many records to expect
      const countResponse = await api.get('/booking/reservations', {
        params: { ...queryParams, limit: 1 }
      });

      const total = countResponse.data?.total || 0;

      if (total === 0) {
        return [];
      }

      // Fetch all records in a single request with a very high limit
      const response = await api.get('/booking/reservations', {
        params: {
          ...queryParams,
          limit: total, // Request all records at once
          page: 1
        }
      });

      if (response.data?.success) {
        // console.log(`Fetched ${response.data.data?.length || 0} reservations`);
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      showApiError(error, "Failed to fetch all reservations");
      console.error('Error fetching all reservations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch all reservations');
    }
  },

  // Get reservation list entries for floor plan view
  async getReservationListOfFloorPlan(branchId, date) {
    if (!branchId) {
      throw new Error('Branch ID is required')
    }

    if (!date) {
      throw new Error('Date is required')
    }

    try {
      const params = {
        branch_id: branchId,
        date: date.toISOString(),
        limit: 100000000
      }
      //date

      // console.log("Reservation list for floor plan date:", date);
      // console.log("Reservation list for floor plan params:", params);

      const response = await api.get('booking/reservations', { params })
      // console.log("Reservation list for floor plan response:", response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch reservation list for floor plan')
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        meta: response.data.meta || {}
      }
    } catch (error) {
      console.error('Get reservation list for floor plan error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch reservation list for floor plan')
    }
  },

  async getAllReservationsReport(params = {}) {
    try {
      // Remove pagination parameters
      const { page, limit, skip, ...filters } = params;

      // Add status and payment_status filters if not provided
      const queryParams = {
        ...filters,
        // reservationStatus: 'CONFIRMED',
        // paymentStatus: 'PAID',
      };


      // Fetch all records in a single request with a very high limit
      const response = await api.get('/booking/reservations/report', {
        params: {
          ...queryParams,
          page: 1
        }
      });
      console.log('response', response)

      if (response.data?.success) {
        // console.log(`Fetched ${response.data.data?.length || 0} reservations`);
        return response.data || [];
      }

      return [];
    } catch (error) {
      showApiError(error, "Failed to fetch all reservations");
      console.error('Error fetching all reservations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch all reservations');
    }
  },

  /**
   * Get filtered reservations using server-side filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Filtered reservations with pagination
   */
  async getFilteredReservations(filters = {}) {
    try {
      const response = await api.get('/booking/reservations/filter', { params: filters });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination || {},
          filters_applied: response.data.filters_applied || {},
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
          page: response.data.pagination?.page || 1
        };
      } else {
        throw new Error(response.data.message || 'Failed to filter reservations');
      }
    } catch (error) {
      showApiError(error, "Failed to filter reservations");
      console.error('Filter reservations error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to filter reservations',
        data: [],
        pagination: {},
        total: 0,
        pages: 1,
        page: 1
      };
    }
  },

  /**
   * Get filtered reservations for reports using server-side filtering
   * @param {Object} filters - Filter parameters for reports
   * @returns {Promise<Object>} - Filtered reservations with pagination and summary
   */
  async getFilteredReservationsReport(filters = {}) {
    try {
      const response = await api.get('/booking/reservations/report/filter', { params: filters });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination || {},
          summary: response.data.summary || {},
          filters_applied: response.data.filters_applied || {},
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
          page: response.data.pagination?.page || 1
        };
      } else {
        throw new Error(response.data.message || 'Failed to filter reservations for report');
      }
    } catch (error) {
      showApiError(error, "Failed to filter reservations for report");
      console.error('Filter reservations report error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to filter reservations for report',
        data: [],
        pagination: {},
        summary: {},
        total: 0,
        pages: 1,
        page: 1
      };
    }
  },

}
