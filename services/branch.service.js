import { showApiError } from "@/lib/apiErrorHandler";
import api from "./api";

export const branchService = {
  async getAllBranches(page = 1, limit = 10, filterParams = {}) {
    try {
      const response = await api.get("/branch", {
        params: {
          page,
          limit,
          ...filterParams,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch branches");
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total,
        pages: response.data.pages,
        current_page: response.data.page,
      };
    } catch (error) {
      showApiError(error, "Failed to load branch list");

      console.error("Error fetching branches:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch branches"
      );
    }
  },

  /**
   * Get all branches without file attachments and without pagination limits
   * @param {Object} filterParams - Optional filter parameters
   * @returns {Promise<Object>} - Promise that resolves to branch data
   */
  async getAllBranchesWithoutFiles(filterParams = {}) {
    try {
      const response = await api.get("/branch", {
        params: {
          limit: 1000, // Very large limit to get all branches
          excludeFiles: true, // Exclude file attachments to reduce payload size
          ...filterParams,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch branches");
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      showApiError(error, "Failed to load branch list");

      console.error("Error fetching branches without files:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch branches",
        data: [],
      };
    }
  },

  async getAllBranchesWithPaginations(params = {}) {
    const { page = 1, limit = 10, skip = 0, ...filterParams } = params;
    try {
      // console.log('Fetching branches with params:', { page, limit, skip });
      
      const response = await api.get('/branch', {
        params: { 
          page, 
          limit,
          skip, // Explicitly include the skip parameter
          ...filterParams
        }
      })
      
      // console.log('Branch API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch branches");
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total,
        pages: response.data.pages,
        current_page: response.data.page,
      };
    } catch (error) {
      showApiError(error, "Failed to load branch list");
      console.error("Error fetching branches:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch branches"
      );
    }
  },

  async createBranch(branchData) {
    try {
      // console.log('=== BRANCH SERVICE: CREATE BRANCH CALLED ===');
      
      // Log the formData contents for debugging
      if (branchData instanceof FormData) {
        // console.log('FormData contents:');
        const formDataKeys = [];
        let hasLogoImage = false;
        let hasCoverImage = false;
        let hasCoverVideo = false;

        for (let [key, value] of branchData.entries()) {
          formDataKeys.push(key);
          // console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.type}, ${value.size} bytes)` : value}`);
          
          // Track media files specifically
          if (key === "logo_image" && value instanceof File) {
            hasLogoImage = true;
            // console.log('logo_image details:', {
            //   name: value.name,
            //   type: value.type,
            //   size: value.size,
            //   lastModified: value.lastModified
            // });
          }
          if (key === "cover_image" && value instanceof File) {
            hasCoverImage = true;
            // console.log('cover_image details:', {
            //   name: value.name,
            //   type: value.type,
            //   size: value.size,
            //   lastModified: value.lastModified
            // });
          }
          if (key === "cover_video" && value instanceof File) {
            hasCoverVideo = true;
            // console.log('cover_video details:', {
            //   name: value.name,
            //   type: value.type,
            //   size: value.size,
            //   lastModified: value.lastModified
            // });
          }
        }
        
        // console.log('FormData keys:', formDataKeys);
        // console.log('Media files present:', {
        //   hasLogoImage,
        //   hasCoverImage,
        //   hasCoverVideo
        // });
      } else {
        // console.log('Sending JSON data:', branchData);
      }

      // Make the API request
      // console.log('Sending API request...');
      const response = await api.post('/branch', branchData, {
        headers: {
          Accept: "application/json",
          // Let the browser set the Content-Type with boundary for FormData
        },
        transformRequest: [(data) => {
          // Prevent axios from trying to transform FormData
          if (data instanceof FormData) {
            // console.log('Preventing FormData transformation');
            return data;
          }
          return JSON.stringify(data);
        }],
      });

      // console.log('Response received:', response.status, response.statusText);

      // Check if there are any failed operations in the response
      if (response.data.data?.failed && response.data.data.failed.length > 0) {
        // Get the first error message from failed operations
        const errorMessage = response.data.data.failed[0]?.error || "Failed to create branch";
        throw new Error(errorMessage);
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create branch");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to create branch");
      console.error("Error creating branch:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create branch"
      );
    }
  },

  async updateBranch(id, formData) {
    try {
      // console.log('=== BRANCH SERVICE: UPDATE BRANCH CALLED ===');
      // console.log('Branch ID:', id);
      
      // Log the formData contents for debugging
      // console.log('FormData contents:');
      const formDataKeys = [];
      let hasLogoImage = false;
      let hasCoverImage = false;
      let hasCoverVideo = false;

      for (let [key, value] of formData.entries()) {
        formDataKeys.push(key);
        // console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.type}, ${value.size} bytes)` : value}`);
        
        // Track media files specifically
        if (key === "logo_image" && value instanceof File) {
          hasLogoImage = true;
          // console.log('logo_image details:', {
          //   name: value.name,
          //   type: value.type,
          //   size: value.size,
          //   lastModified: value.lastModified
          // });
        }
        if (key === "cover_image" && value instanceof File) {
          hasCoverImage = true;
          // console.log('cover_image details:', {
          //   name: value.name,
          //   type: value.type,
          //   size: value.size,
          //   lastModified: value.lastModified
          // });
        }
        if (key === "cover_video" && value instanceof File) {
          hasCoverVideo = true;
          // console.log('cover_video details:', {
          //   name: value.name,
          //   type: value.type,
          //   size: value.size,
          //   lastModified: value.lastModified
          // });
        }
      }
      
      // console.log('FormData keys:', formDataKeys);
      // console.log('Media files present:', {
      //   hasLogoImage,
      //   hasCoverImage,
      //   hasCoverVideo
      // });

      // Ensure proper URL construction with query parameter
      const url = `/branch?id=${id}`
      // console.log('API endpoint URL:', url);

      // Make the API request
      // console.log('Sending API request with FormData...');
      const response = await api.put(url, formData, {
        headers: {
          Accept: "application/json",
          // Let the browser set the Content-Type with boundary
        },
        transformRequest: [(data) => {
          // Prevent axios from trying to transform FormData
          if (data instanceof FormData) {
            // console.log('Axios transformRequest: preserving FormData');
            return data;
          }
          // console.log('Axios transformRequest: converting to JSON');
          return JSON.stringify(data);
        }],
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      // Log the response for debugging
      // console.log('API Response received:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   dataSuccess: response.data?.success,
      //   dataMessage: response.data?.message
      // });

      // Check if response exists and has data
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check for success flag in response
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update branch");
      }

      // Return the response data with included relations
      return {
        success: true,
        data: response.data.data, // This will include country and brand relations
      };
    } catch (error) {
      console.error("Error updating branch:", error);
      showApiError(error, "Failed to update branch");

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", error.response.data);
        if (error.response.status === 400) {
          throw new Error(
            error.response.data?.message || "Invalid request data"
          );
        } else if (error.response.status === 404) {
          throw new Error("Branch not found");
        } else {
          throw new Error(
            error.response.data?.message || "Server error occurred"
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        throw new Error("No response received from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        throw new Error(error.message || "Failed to update branch");
      }
    }
  },

  async deleteBranch(id) {
    try {
      const response = await api.delete("/branch", {
        params: { id },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete branch");
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      showApiError(error, "Failed to delete branch");
      throw new Error(
        error.response?.data?.message || "Failed to delete branch"
      );
    }
  },

  async searchBranches(query, page = 1, limit = 10) {
    try {
      const response = await api.get("/search", {
        params: {
          type: "branch",
          value: query,
          page,
          limit,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to search branches");
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to search branches");

      console.error("Error searching branches:", error);
      throw new Error(
        error.response?.data?.message || "Failed to search branches"
      );
    }
  },

  async getBranchById(id) {
    try {
      if (!id) throw new Error("Branch ID is required");

      const response = await api.get("/branch", {
        params: { id },
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch branch details"
        );
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to fetch branch details");
      console.error("Error fetching branch:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch branch details"
      );
    }
  },

  async getBranchByIdWithoutFiles(id) {
    try {
      if (!id) throw new Error("Branch ID is required");

      const response = await api.get("/branch", {
        params: {
          id,
          excludeFiles: true,
        },
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch branch details"
        );
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching branch without files:", error);
      showApiError(error, "Failed to fetch branch details");
      throw new Error(
        error.response?.data?.message || "Failed to fetch branch details"
      );
    }
  },

  /**
   * Search for branches by branch code with pagination
   * @param {string} query - The branch code to search for
   * @param {Object} options - Search options
   * @param {number} [options.limit=1000] - Maximum number of results to return
   * @param {number} [options.page=1] - Page number for pagination
   * @returns {Promise<Object>} - Returns the branch data if found
   */
  async searchBranch(query, { limit = 1000, page = 1 } = {}) {
    try {
      // Ensure query is a string and trim any whitespace
      const branchCode = String(query).trim();
      
      if (!branchCode) {
        throw new Error("Branch code is required");
      }

      // Log the request parameters for debugging
      const params = {
        branch_code: branchCode,
        excludeFile: true,
        limit: Math.min(Number(limit), 1000), // Cap the limit to prevent performance issues
        page: Math.max(1, Number(page)) // Ensure page is at least 1
      };
      
      console.log("Searching branch with params:", params);
      
      // Make the API request with paramsSerializer to ensure proper parameter encoding
      const response = await api.get("/branch", {
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });

      console.log("Search response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "No branches found with this code");
      }

      // Ensure we return a consistent response structure
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: {
          total: response.data.total || 0,
          page: response.data.page || 1,
          pages: response.data.pages || 1,
          limit: response.data.limit || limit
        },
        message: response.data.message || "Branches found"
      };
    } catch (error) {
      console.error('Search branch error:', error);
      showApiError(error, "Failed to search branches");
      
      // Return a consistent error response
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search branches",
        error: error
      };
    }
  },

  async deleteBranches(branchIds) {
    try {
      const response = await api.post("/branch/bulk-delete", {
        ids: branchIds,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete branches");
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch branch details");

      throw new Error(
        error.response?.data?.message || "Failed to delete branches"
      );
    }
  },

  getBranchesByBrandId: async (brandId) => {
    try {
      const response = await api.get("/branch", {
        params: { brand_id: brandId, excludeFiles: true, limit: 1000000 },
      });
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to fetch branch details");

      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  async toggleBranchStatus(id, data, type = "json") {
    // Default to JSON for simple updates
    try {
      let requestData = data;
      let headers = {};

      if (type === "formData") {
        if (!(data instanceof FormData)) {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            // Convert boolean to string for FormData
            formData.append(
              key,
              typeof value === "boolean" ? value.toString() : value
            );
          });
          requestData = formData;
        }
        headers = {
          "Content-Type": "multipart/form-data",
        };
      } else {
        // For JSON requests
        headers = {
          "Content-Type": "application/json",
        };
        // Ensure boolean values are properly handled
        if (typeof data.is_active === "boolean") {
          requestData = { ...data };
        }
      }

      const response = await api.put(`/branch?id=${id}`, requestData, {
        headers,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update branch");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to update branch");
      console.error("Error updating branch:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update branch"
      );
    }
  },

  async toggleWaitingListActive(id, data, type = "json") {
    // Default to JSON for simple updates
    try {
      let requestData = data;
      let headers = {};

      if (type === "formData") {
        if (!(data instanceof FormData)) {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            // Convert boolean to string for FormData
            formData.append(
              key,
              typeof value === "boolean" ? value.toString() : value
            );
          });
          requestData = formData;
        }
        headers = {
          "Content-Type": "multipart/form-data",
        };
      } else {
        // For JSON requests
        headers = {
          "Content-Type": "application/json",
        };
        // Ensure boolean values are properly handled
        if (typeof data.is_active_payment === "boolean") {
          requestData = { ...data };
        }
      }

      const response = await api.put(`/branch?id=${id}`, requestData, {
        headers,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update branch");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to update branch");
      console.error("Error updating branch:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update branch"
      );
    }
  },

  async togglePaymentActive(id, data, type = "json") {
    // Default to JSON for simple updates
    try {
      let requestData = data;
      let headers = {};

      if (type === "formData") {
        if (!(data instanceof FormData)) {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            // Convert boolean to string for FormData
            formData.append(
              key,
              typeof value === "boolean" ? value.toString() : value
            );
          });
          requestData = formData;
        }
        headers = {
          "Content-Type": "multipart/form-data",
        };
      } else {
        // For JSON requests
        headers = {
          "Content-Type": "application/json",
        };
        // Ensure boolean values are properly handled
        if (typeof data.is_active_payment === "boolean") {
          requestData = { ...data };
        }
      }

      const response = await api.put(`/branch?id=${id}`, requestData, {
        headers,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update branch");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to update branch");
      console.error("Error updating branch:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update branch"
      );
    }
  },
};
