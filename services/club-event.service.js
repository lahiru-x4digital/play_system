import api from './api';


const actionTrackerService = {
 
  /**
   * Fetch failed club events with optional filters.
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {string} [params.mobile_number]
   * @returns {Promise<Object>}
   */
  async getFailedClubEvents({ page = 1, limit = 10, mobile_number = null,status = null }) {
    try {
      const params = {
        page,
        limit,
      };
      if (mobile_number) {
        params.mobile_number = mobile_number;
      }
      if (status) {
        params.status = status;
      }

      const response = await api.get("/club-events", { params });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch club events");
      }

      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
      };
    } catch (error) {
      // Optionally use a global error handler if you have one
      // showApiError(error, "Failed to fetch club events");
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch club events",
      };
    }
  },


  
  
};

export default actionTrackerService;
