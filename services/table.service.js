import api from './api'

export const tableService = {
  /**
   * Get all tables with pagination
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {number} params.skip
   */
  async getAllTables(params = {}) {
    try {
      // Always include walkins by default
      const response = await api.get('/booking/tables', { 
        params: {
          ...params,
          includeWalkins: true // Add this parameter to include walk-in data
        }
      });
      
      console.log('Fetched tables with walkins:', response.data.data?.length);
      
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error('Get tables error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch tables',
      };
    }
  },

  /**
   * Get tables by section ID
   * @param {string|number} sectionId
   */
  async getTablesBySection(sectionId) {
    try {
      const response = await api.get(`/booking/tables`, {
        params: { sectionId }
      })
      return {
        success: true,
        data: response.data.data || []
      }
    } catch (error) {
      console.error('Get tables by section error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tables'
      }
    }
  },

  /**
   * Get table by ID
   * @param {string|number} id
   */
  async getTableById(id) {
    try {
      const response = await api.get(`/booking/tables?id=${id}`)
      return response.data
    } catch (error) {
      console.error('Get table error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch table')
    }
  },

  /**
   * Create new table
   * @param {Object} data
   * @param {string} data.table_number
   * @param {number} data.capacity
   * @param {string} data.shape
   * @param {number} data.section_id
   * @param {number} data.x_position
   * @param {number} data.y_position
   */
  async createTable(data) {
    try {
      const response = await api.post('/booking/tables', data)
      return response.data
    } catch (error) {
      console.error('Create table error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create table')
    }
  },

  /**
   * Update table
   * @param {string|number} id
   * @param {Object} data
   */
  async updateTable(id, data) {
    try {
      const response = await api.put(`booking/tables?id=${id}`, data)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update table')
      }

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Update table error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update table')
    }
  },

  /**
   * Delete single table
   * @param {string|number} id
   */
  async deleteTable(id) {
    try {
      const response = await api.delete(`/booking/tables?id=${id}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete table')
      }

      return {
        success: true,
        message: 'Table deleted successfully'
      }
    } catch (error) {
      console.error('Delete table error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete table')
    }
  },

  /**
   * Bulk delete tables
   * @param {Array<number>} ids Array of table IDs to delete
   */
  async bulkDeleteTables(ids) {
    try {
      const response = await api.delete('/booking/tables', {
        data: { ids }
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete tables')
      }

      return {
        success: true,
        message: 'Tables deleted successfully'
      }
    } catch (error) {
      console.error('Bulk delete tables error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete tables')
    }
  },
} 