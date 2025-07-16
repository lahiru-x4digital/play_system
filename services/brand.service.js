import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

export const brandService = {
  async getAllBrands(params = {}) {
    try {
      // Set default values
      const { 
        page = 1, 
        limit = 10, 
        skip = (page - 1) * limit,
        ...searchParams 
      } = params;

      const response = await api.get('/brand', {
        params: {
          page: Number(page),
          limit: Number(limit),
          skip: Number(skip),
          ...searchParams
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch brands')
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        pages: response.data.pages || 1,
        page: Number(page)
      }
    } catch (error) {
      showApiError(error, "Failed to load brands");
    }
  },

  /**
   * Get all brands without file attachments and without pagination limits
   * @param {Object} searchParams - Optional search parameters
   * @returns {Promise<Object>} - Promise that resolves to brand data
   */
  /**
   * Get a single brand by brand_code with an option to exclude files
   * @param {string} brandCode - The brand_code to search for
   * @param {Object} options - Options object
   * @param {boolean} [options.excludeFiles=false] - Whether to exclude file URLs
   * @returns {Promise<Object>} - Promise that resolves to brand data
   */
  async getBrandByCode(brandCode, { excludeFiles = false } = {}) {
    try {
      if (!brandCode) {
        throw new Error('Brand code is required');
      }

      const response = await api.get('/brand', {
        params: {
          brand_code: brandCode,
          excludeFiles: excludeFiles
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Brand not found');
      }

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      showApiError(error, 'Failed to fetch brand details');
      return {
        success: false,
        message: error.message || 'Failed to fetch brand details'
      };
    }
  },

  /**
   * Get all brands without file attachments and without pagination limits
   * @param {Object} searchParams - Optional search parameters
   * @returns {Promise<Object>} - Promise that resolves to brand data
   */
  async getAllBrandsWithoutFiles(searchParams = {}) {
    try {
      const response = await api.get('/brand', {
        params: {
          limit: 10000000000, // Very large limit to get all brands
          excludeFiles: true, // Exclude file attachments to reduce payload size
          ...searchParams
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch brands')
      }

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error) {
       showApiError(error, "Failed to load brands");
      console.error('Error fetching brands without files:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch brands',
        data: []
      }
    }
  },

  async getBrandFromId(brandId) {
    try {
      const response = await api.get(`/brand`);
      const brands = response.data.data;

      // Filter the brands array to find the brand with the matching ID
      const brand = brands.find(brand => brand.id === brandId);

      if (brand) {
        return {
          success: true,
          data: brand || [],
        }
      } else {
        console.error('Brand not found');
        return {
          success: false,
          data: [],
          error: 'Brand not found',
        };
      }
    } catch (error) {
      showApiError(error, "Failed to load brands");

      console.error('Error fetching brand:', error);
    }
  },


  async createBrand(formData) {
    if (!(formData instanceof FormData)) {
      throw new Error('Data must be FormData')
    }

    try {
      const response = await api.post('/brand', formData, {
        headers: {
          'Accept': 'application/json',
        },
        transformRequest: [(data) => {
          // Prevent axios from trying to transform FormData
          if (data instanceof FormData) {
            return data
          }
          return JSON.stringify(data)
        }],
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create brand')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to create brand");

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  },

  async updateBrand(brandId, formData) {
    if (!brandId) {
      throw new Error('Brand ID is required')
    }

    if (!(formData instanceof FormData)) {
      throw new Error('Data must be FormData')
    }

    try {
      // Log the request details for debugging
      // console.log('Sending update request for brand ID:', brandId)
      // console.log('FormData contains:', Array.from(formData.keys()))

      const response = await api.put('/brand', formData, {
        params: { id: brandId },
        headers: {
          'Accept': 'application/json',
          // Let the browser set the Content-Type with boundary
        },
        transformRequest: [(data) => {
          // Prevent axios from trying to transform FormData
          if (data instanceof FormData) {
            return data
          }
          return JSON.stringify(data)
        }],
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update brand')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to update brand");

      throw new Error(error.response?.data?.message || 'Failed to update brand')
    }
  },

  async deleteBrand(brandId) {
    if (!brandId) {
      throw new Error('Brand ID is required')
    }

    try {
      const response = await api.delete('/brand', {
        params: { id: brandId }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete brand')
      }

      return response.data
    } catch (error) {
    
      showApiError(error, "Failed to delete brand");
      console.error('Error deleting brand:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete brand')
    }
  },

  async getBrandById(brandIdentifier) {
    if (!brandIdentifier) {
      throw new Error('Brand identifier is required')
    }

    try {
      // By default, exclude large file data to make the initial load faster
      const response = await api.get('/brand', {
        params: {
          ...(isNaN(brandIdentifier)
            ? { brand_Id: brandIdentifier }
            : { id: brandIdentifier }
          ),
          excludeFiles: true // Get metadata only initially
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch brand')
      }

      return response.data.data
    } catch (error) {
      showApiError(error, "Failed to fetch brand");
      console.error('Error fetching brand:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch brand')
    }
  },

  // Rename getBrandFile to getBrandMedia to match function calls in page.js
  async getBrandMedia(brandId, fileField) {
    if (!brandId || !fileField) {
      throw new Error('Brand ID and file field are required')
    }

    try {
      const response = await api.get('/brand/file', {
        params: {
          id: brandId,
          field: fileField
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to fetch brand ${fileField}`)
      }

      return response.data.data
    } catch (error) {
      showApiError(error, "Failed to fetch brand");
      console.error(`Error fetching brand ${fileField}:`, error)
      throw new Error(error.response?.data?.message || `Failed to fetch brand ${fileField}`)
    }
  },

  // Simplify the formatMediaBase64 function similar to formatBase64Image
  formatMediaBase64(base64String, type = 'image/jpeg') {
    // Check if base64String is null, undefined or not a string
    if (!base64String || typeof base64String !== 'string') {
      console.warn('Invalid base64 data received:', base64String);
      return null;
    }
    
    // If it's already a data URL, return as is
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    
    // If it's a URL, return as is
    if (base64String.startsWith('http') || base64String.startsWith('/')) {
      return base64String;
    }
    
    // For all other base64 content, add the appropriate data URI prefix
    return `data:${type};base64,${base64String}`;
  }

  
} 