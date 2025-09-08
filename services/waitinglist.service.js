import api from './api'

// Add subscription source for waiting lists with optimized polling
export const waitingListSubscription = (branchId) => {
  return {
    subscribe: (callback) => {
      if (!branchId) {
        console.warn('No branchId provided to waitingListSubscription');
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
          const response = await api.get('/booking/waiting-list', {
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
              console.error('Waiting list fetch error:', error.message);
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

export const waitingListService = {
  // Get all waiting list entries with pagination and filters
  async getAllWaitingList({ page = 1, limit = null, skip = 0, branch_id, status, sort_by = 'created_date', sort_order = 'desc' }) {
    try {
      // Use a very large number for limit to ensure we get all entries
      const effectiveLimit = limit === null ? 1000000000 : limit;

      // console.log('Fetching waiting list with params:', {
      //   page,
      //   effectiveLimit,
      //   originalLimit: limit,
      //   skip,
      //   branch_id,
      //   status,
      //   sort_by,
      //   sort_order
      // });

      // Prepare params object with a very large limit if null was specified
      const params = {
        page,
        limit: effectiveLimit, // Always include limit with a large number if null
        skip: (page - 1) * (effectiveLimit || 0),
        sort_by,
        sort_order,
        ...(branch_id && { branch_id }),
        ...(status && { status }),
      };

      // console.log('API params being sent:', params);
      const response = await api.get('/booking/waiting-list', { params });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch waiting list entries')
      }

      // Ensure pagination data is properly passed through
      return {
        success: true,
        data: response.data.data || [],
        // Include both meta object and top-level pagination properties
        meta: {
          ...(response.data.meta || {}),
          total: response.data.total || response.data.meta?.total || 0,
          pages: response.data.pages || response.data.meta?.pages || 1
        },
        // Also include top-level pagination properties for backward compatibility
        total: response.data.total || response.data.meta?.total || 0,
        pages: response.data.pages || response.data.meta?.pages || 1,
        page: response.data.page || response.data.meta?.page || 1
      }

    } catch (error) {
      console.error('Get waiting list error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch waiting list entries')
    }
  },

  // Get specific waiting list entry by ID
  async getWaitingListById(id) {
    if (!id) {
      throw new Error('Waiting list ID is required')
    }

    try {
      const response = await api.get(`/booking/waiting-list?id=${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Waiting list entry not found')
      }

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Get waiting list by ID error:', error)
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Waiting list entry not found'
        }
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch waiting list entry')
    }
  },

  // Create new waiting list entry
  async createWaitingList(waitingListData) {
    try {
      // console.log('Creating waiting list entry with data:', waitingListData)

      // Format the data according to the API requirements
      const formattedData = {
        customer_id: parseInt(waitingListData.customer_id, 10),
        branch_id: parseInt(waitingListData.branch_id, 10),
        status: waitingListData.status || 'WAITING',
        party_size: typeof waitingListData.party_size === 'number' ? waitingListData.party_size : parseInt(waitingListData.party_size, 10),
        table_ids: waitingListData.table_ids || [],
        notes: waitingListData.notes || '',
        archive: waitingListData.archive || false,
        createdAt: new Date()
      }

      console.log("formattedData: ", formattedData)

      // Remove any undefined or null values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null || Number.isNaN(formattedData[key])) {
          if (key === 'party_size') {
            formattedData[key] = 1; // Default to 1 if invalid
          } else if (key === 'table_ids') {
            formattedData[key] = []; // Default to empty array
          } else {
            delete formattedData[key];
          }
        }
      });

      const response = await api.post('/booking/waiting-list', formattedData)

      // console.log('API response:', response.data)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create waiting list entry')
      }

      return response.data
    } catch (error) {
      console.error('Create waiting list error:', error)
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to create waiting list entry')
      }
      throw error
    }
  },

  // Update waiting list entry
  async updateWaitingList(id, updateData) {
    if (!id) {
      throw new Error('Waiting list ID is required');
    }

    try {
      // Create a clean data object with only the fields we want to send
      const payload = {};

      // Only include whitelisted fields
      const allowedFields = ['status', 'notes', 'party_size', 'archive', 'table_ids'];

      // Copy only allowed fields to the payload
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          payload[key] = updateData[key];
        }
      });

      // If table_ids is provided as tables (for backward compatibility)
      if (updateData.tables && !updateData.table_ids) {
        payload.table_ids = Array.isArray(updateData.tables)
          ? updateData.tables
          : [updateData.tables];
      }

      const response = await api.put(`/booking/waiting-list?id=${id}`, payload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update waiting list entry');
      }

      return response.data;
    } catch (error) {
      console.error('Update waiting list error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update waiting list entry');
    }
  },

  // Delete waiting list entry
  async deleteWaitingList(id) {
    if (!id) {
      throw new Error('Waiting list ID is required')
    }

    try {
      const response = await api.delete(`/booking/waiting-list?id=${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete waiting list entry')
      }

      return response.data
    } catch (error) {
      console.error('Delete waiting list error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete waiting list entry')
    }
  },

  // Get waiting list entries by branch with pagination
  async getWaitingListByBranch(branchId, { page = 1, limit = 1000000000000 } = {}) {
    if (!branchId) {
      throw new Error('Branch ID is required')
    }

    try {
      const response = await api.get('/booking/waiting-list', {
        params: {
          branch_id: branchId,
          page,
          limit,
          sort_by: 'created_date',
          sort_order: 'desc'
        }
      });

      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error('Get branch waiting list error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch branch waiting list');
    }
  },

  // Get waiting list entries by customer
  async getWaitingListByCustomer(customerId) {
    if (!customerId) {
      throw new Error('Customer ID is required')
    }

    try {
      const response = await api.get(`/booking/waiting-list?customer_id=${customerId}`)

      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta || {}
      }
    } catch (error) {
      console.error('Get customer waiting list error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch customer waiting list')
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

      // Build search parameters based on query type
      const searchParams = {
        ...params,
        limit: null // Reasonable limit for search results
      };

      // Add appropriate search parameter based on query type
      if (isMobileNumber) {
        searchParams.mobile_number = query.replace(/[\s-]/g, '');
      }

      // console.log('Searching waiting list with params:', searchParams);

      const response = await api.get('/booking/waiting-list', { params: searchParams });

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
      console.error('Search waiting list error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search waiting list',
        data: []
      };
    }
  },

  /**
   * Get all waiting list entries without pagination
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Array>} - Array of all matching waiting list entries
   */
  async getAllWaitingListWithoutPagination(params = {}) {
    try {
      // console.log('getAllWaitingListWithoutPagination - Input params:', JSON.stringify(params, null, 2));

      // First get total count with the same filters
      const queryParams = { ...params, limit: 1 };

      // Remove pagination parameters for count
      delete queryParams.page;
      delete queryParams.skip;

      // console.log('Making count request with params:', JSON.stringify(queryParams, null, 2));

      const countResponse = await api.get('/booking/waiting-list', {
        params: { ...queryParams, limit: 1 }
      });

      const total = countResponse.data?.total || 0;
      // console.log('Total records matching filters:', total);

      if (total === 0) {
        // console.log('No records found matching the filters');
        return [];
      }

      // Fetch all records in a single request with a very high limit
      // console.log('Fetching all records with params:', JSON.stringify({
      //   ...queryParams,
      //   limit: total,
      //   page: 1
      // }, null, 2));

      const response = await api.get('/booking/waiting-list', {
        params: {
          ...queryParams,
          limit: total, // Request all records at once
          page: 1
        }
      });

      if (response.data?.success) {
        // console.log(`Successfully fetched ${response.data.data?.length || 0} waiting list entries`);
        if (response.data.data?.length > 0) {
          // console.log('Sample entry:', {
          //   id: response.data.data[0].id,
          //   status: response.data.data[0].status,
          //   customer: response.data.data[0].customer?.first_name
          // });
        }
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching all waiting list entries:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch all waiting list entries');
    }
  },

  async getAllWaitingListWithoutPagination(params = {}) {
    try {
      // Remove pagination parameters
      const { page, limit, skip, ...filters } = params;

      // Set a very high limit to get all records at once
      const response = await this.getAllWaitingList({
        ...filters,
        page: 1,
        limit: 10000000, // High limit to get all records
        sort_by: 'created_date',
        sort_order: 'desc'
      });

      // If the response is paginated, return the data array
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // If the response is already an array, return it directly
      if (Array.isArray(response)) {
        return response;
      }

      // If the response has a different structure, try to extract the data
      if (response && response.data) {
        return response.data;
      }

      console.warn('Unexpected response format in getAllWaitingListWithoutPagination:', response);
      return [];
    } catch (error) {
      console.error('Error fetching waiting list without pagination:', error);
      throw error;
    }
  },

  // /**
  //  * Get waiting list data formatted for Flooplan
  //  * @param {string} branchId - The ID of the branch
  //  * @param {string} date - The date in ISO format (e.g., '2025-05-17T18:42:02.553Z')
  //  * @returns {Promise<Object>} - The waiting list data
  //  */
  // async getWaitingListForFlooplan(branchId, date) {
  //   try {
  //     if (!branchId || !date) {
  //       throw new Error('Branch ID and date are required');
  //     }

  //     const params = {
  //       branch_id: branchId,
  //       date: new Date(date).toISOString()
  //     };

  //     const response = await api.get('/booking/waiting-list', { params });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching waiting list for Flooplan:', error);
  //     throw error;
  //   }
  // },

  // Get waiting list entries for floor plan view
  async getWaitingListOfFloorPlan(branchId, date) {
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

      const response = await api.get('booking/waiting-list', { params })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch waiting list for floor plan')
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        meta: response.data.meta || {}
      }
    } catch (error) {
      console.error('Get waiting list for floor plan error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch waiting list for floor plan')
    }
  }
}
