import api from './api';

export const walkInService = {
  // Get walk-in list with pagination and filters (for walk-in list page)
  async getWalkInList({ 
    page = 1, 
    limit = 10, 
    branch_id, 
    status, 
    date, 
    sort_by = 'createdAt', 
    sort_order = 'desc',
    search = ''
  } = {}) {
    try {
      // Build params object
      const params = {
        page,
        limit,
        sort_by,
        sort_order,
      };
      
      // Add filters if provided
      if (branch_id) params.branch_id = branch_id;
      if (status && status !== 'all') params.status = status;
      if (date) params.date = date;
      if (search) params.search = search;
      
      console.log('Fetching walk-in list with params:', params);
      
      // Make sure we're using the correct endpoint
      const response = await api.get('/booking/walkin-list', { params });
      
      console.log('Walk-in list response:', response.data);
      
      // Handle the response structure
      if (response.data) {
        return {
          success: true,
          data: Array.isArray(response.data.data) ? response.data.data : [],
          meta: response.data.meta || {
            total: response.data.total || 0,
            pages: response.data.pages || 1,
            page: response.data.page || 1,
            limit: response.data.limit || limit
          }
        };
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error in getWalkInList:', error);
      throw error;
    }
  },

  // Original get all walk-ins function (kept for backward compatibility)
  // Get all walk-in entries with pagination and filters
  async getAllWalkIns({ 
    page = 1, 
    limit = null, 
    skip = 0, 
    branch_id, 
    status, 
    date, 
    sort_by = 'createdAt', 
    sort_order = 'desc',
    search = ''
  } = {}) {
    try {
      const effectiveLimit = limit === null ? 1000 : limit;
      
      // Build params object
      const params = {
        page,
        limit: effectiveLimit,
        skip: (page - 1) * (effectiveLimit || 0),
        sort_by,
        sort_order,
      };
      
      // Add filters if provided
      if (branch_id) params.branch_id = branch_id;
      if (status && status !== 'all') params.status = status;
      if (date) params.date = date;
      if (search) params.search = search;
      
      const response = await api.get('/booking/walkin-list', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching walk-ins:', error);
      throw error;
    }
  },

  // Get specific walk-in entry by ID
  async getWalkInById(id) {
    if (!id) {
      throw new Error('Walk-in ID is required');
    }
    
    try {
      // console.log(`Fetching walk-in with ID: ${id}`);
      const response = await api.get('/booking/walkin-list', {
        params: { id }
      });
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to fetch walk-in');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching walk-in with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new walk-in entry
  async createWalkIn(walkInData) {
    try {
      const response = await api.post('/booking/walkin-list', walkInData);
      return response.data;
    } catch (error) {
      console.error('Error creating walk-in:', error);
      throw error;
    }
  },

  // Update walk-in entry
  async updateWalkIn(id, updateData) {
    // console.log('update called: ', id, updateData)
    if (!id) {
      throw new Error('Walk-in ID is required');
    }

    try {
      // Create a clean data object with only the fields we want to send
      const payload = {};
      
      // Only include whitelisted fields
      const allowedFields = ['status', 'notes', 'party_size', 'customer_name', 'archive', 'tables'];
      
      // Copy only allowed fields to the payload
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          payload[key] = updateData[key];
        }
      });

      // If table_ids is provided, use it as tables (for backward compatibility)
      if (updateData.table_ids && !updateData.tables) {
        payload.tables = Array.isArray(updateData.table_ids) 
          ? updateData.table_ids 
          : [updateData.table_ids];
      }

      // console.log('Updating walk-in entry with payload:', payload);
      const response = await api.put(`/booking/walkin-list?id=${id}`, payload);
      
      // console.log('Update API response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update walk-in entry');
      }

      return response.data;
    } catch (error) {
      console.error('Update walk-in error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update walk-in entry');
    }
  },

  // Assign tables to a walk-in
  // async assignTable(walkInId, tableIds) {
  //   if (!walkInId) {
  //     throw new Error('Walk-in ID is required');
  //   }

  //   try {
  //     const tables = Array.isArray(tableIds) ? tableIds : [tableIds];
  //     return await this.updateWalkIn(walkInId, { tables });
  //   } catch (error) {
  //     console.error('Error assigning tables to walk-in:', error);
  //     throw error;
  //   }
  // },

  // Delete walk-in entry
  async deleteWalkIn(id) {
    try {
      const response = await api.delete(`/booking/walkin-list/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting walk-in with ID ${id}:`, error);
      throw error;
    }
  },

  // Get walk-in entries by branch with pagination
  async getWalkInsByBranch(branchId, { page = 1, limit = 50, date = null } = {}) {
    try {
      const response = await this.getAllWalkIns({
        page,
        limit,
        branch_id: branchId,
        date
      });
      return response;
    } catch (error) {
      console.error(`Error fetching walk-ins for branch ${branchId}:`, error);
      throw error;
    }
  },

  // Assign table(s) to a walk-in
  // async assignTable(walkInId, tableIds) {
  //   try {
  //     const response = await api.put(`/booking/walkin-list/${walkInId}`, {
  //       table_ids: Array.isArray(tableIds) ? tableIds : [tableIds]
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Error assigning table to walk-in ${walkInId}:`, error);
  //     throw error;
  //   }
  // },

  // Search walk-ins by query string
  async searchWalkIns(query, params = {}) {
    try {
      const response = await api.get('/booking/walkin-list/search', {
        params: { ...params, q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching walk-ins:', error);
      throw error;
    }
  },

  // Update walk-in status
  async updateWalkInStatus(id, status, date = null) {
    console.log('updateWalkInStatusService called: ', id, status, date);
    try {
      let statusValue = status;
      
      // Handle different status object formats
      if (typeof status === 'object') {
        // Case 1: Status object with value property (e.g., {value: 'SEATED', label: 'Seated'})
        if ('value' in status) {
          statusValue = status.value;
        } 
        // Case 2: Status object with status property (e.g., {status: 'COMPLETED'})
        else if ('status' in status) {
          statusValue = status.status;
        }
      }
      
      // Ensure we have a valid status value
      if (!statusValue) {
        console.warn('No valid status value found in:', status);
        throw new Error('Invalid status value provided');
      }
      
      // Create payload with the status string
      const payload = { status: statusValue };
      console.log('Sending payload:', payload);
      
      // Use query parameter for ID and send only the status in the body
      const response = await api.put(`/booking/walkin-list?id=${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for walk-in ${id}:`, error);
      throw error;
    }
  },

  // Remove table from walk-in
  async removeTable(walkInId, tableId) {
    try {
      const response = await api.put(`/booking/walkin-list?id=${walkInId}`, {
        tables: []  // Empty array will trigger removal of all tables
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing table from walk-in ${walkInId}:`, error);
      throw error;
    }
  },
  
    // Get walkin list entries for floor plan view
    async getWalkInListOfFloorPlan(branchId, date) {
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
          limit: 10000000
        }
  
        const response = await api.get('booking/walkin-list', { params })
  
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch walkin list for floor plan')
        }
  
        return {
          success: true,
          data: response.data.data || [],
          total: response.data.total || 0,
          meta: response.data.meta || {}
        }
      } catch (error) {
        console.error('Get walkin list for floor plan error:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch walkin list for floor plan')
      }
    },

  // Get walk-ins report for a date range
  async getWalkInsReport(startDate, endDate, duration = '30m') {
    try {
      console.log('Fetching walk-ins report with params:', {
        startDate,
        endDate,
        duration
      });

      // Make the API call
      const response = await api.get('/booking/walkin-list/report', {
        params: {
          start_date: startDate,
          end_date: endDate,
          duration: duration
        }
      });

      // console.log('Walk-ins Report API Response:', response.data);

      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        throw new Error('API response missing success flag or data');
      }

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('Get walk-ins report error:', error);
      throw error;
    }
  },

  // Helper methods
  getDurationInMinutes(duration) {
    const durationMap = {
      '30m': 30,
      '1h': 60,
      '2h': 120,
      '3h': 180,
      '4h': 240,
      '5h': 300,
      '6h': 360
    };
    return durationMap[duration] || 30;
  },

  formatTimeRange(startTime, endTime) {
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  },

  // Utility method to get yesterday's date in YYYY-MM-DD format
  getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  },

  // Utility method to format date for API
  formatDateForAPI(date) {
    return new Date(date).toISOString().split('T')[0];
  },

  // Validate duration options
  isValidDuration(duration) {
    const validDurations = ['30m', '1h', '2h', '3h', '4h', '5h', '6h'];
    return validDurations.includes(duration);
  },

  // Get duration options for frontend dropdown
  getDurationOptions() {
    return [
      { value: "30m", label: "30 min" },
      { value: "1h", label: "1 hour" },
      { value: "2h", label: "2 hours" },
      { value: "3h", label: "3 hours" },
      { value: "4h", label: "4 hours" },
      { value: "5h", label: "5 hours" },
      { value: "6h", label: "6 hours" }
    ];
  },
};

export default walkInService;