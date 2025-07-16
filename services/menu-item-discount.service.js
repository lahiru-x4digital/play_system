import { showApiError } from '@/lib/apiErrorHandler'
import api from './api'

export const menuItemDiscountService = {
  async updateMenuItemDiscountStatus(id, is_active) {
    if (!id) throw new Error('Discount ID is required')
    try {
      const response = await api.put(`/menu-item-discount?id=${id}`, { is_active })
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update status')
      }
      return response.data
    } catch (error) {
      showApiError(error, 'Failed to update menu item discount status')
      throw error
    }
  },
  async getMenuItemDiscounts({ page = 1, limit = 10 } = {}) {
    try {
      const response = await api.get('/menu-item-discount', {
        params: { page, limit }
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch menu item discounts');
      }
      return {
        success: true,
        data: response.data.data || [],
        pagination: {
          total: response.data.total,
          pages: response.data.pages,
          current_page: response.data.page,
          per_page: response.data.per_page
        }
      };
    } catch (error) {
      showApiError(error, "Failed to fetch menu item discounts");
      console.error('Get menu item discounts error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch menu item discounts');
    }
  },

  async createMenuItemDiscount(data) {
    try {
      // Ensure expiry_date is properly handled before sending to API
      const formattedData = { ...data };

      // Log the expiry date for debugging
      console.log('Service layer - expiry_date before API call:', formattedData.expiry_date);

      const response = await api.post('/menu-item-discount', formattedData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create menu item discount');
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to create menu item discount");
      console.error('Create menu item discount error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create menu item discount');
    }
  },

  // async addMenuItemDiscountCode(id, data) {
  //   try {
  //     // const response = await api.post(`/menu-item-discount/${id}/codes`, data);
  //     const response = await api.post(`/menu-item-discount/code?id=${id}`, data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Add discount code error:', error);
  //     throw new Error(error.response?.data?.message || "Failed to add discount code");
  //   }
  // },


  async updateMenuItemDiscount(id, data) {
    try {
      const formattedData = {
        discount_id: data.discount_id,
        discount_name: data.discount_name,
        description: data.description,
        expiry_date: data.expiry_date,
        emc_code: data.emc_code,
        start_date: data.start_date,
        end_date: data.end_date,
        max_discount_amount: data.max_discount_amount,
        min_order_value: data.min_order_value,
        max_usage_per_customer: data.max_usage_per_customer,
        max_usage_count: data.max_usage_count,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        days: data.days,
        is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
        // countries: Array.isArray(data.countries) ? data.countries.map(Number) : [],
        // brands: Array.isArray(data.brands) ? data.brands.map(Number) : [],
        // branches: Array.isArray(data.branches) ? data.branches.map(Number) : [],
        // menu_items: Array.isArray(data.menu_items) ? data.menu_items.map(Number) : []
      }

      const response = await api.put(`/menu-item-discount?id=${id}`, formattedData)
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update menu item discount");
      console.error('Update menu item discount error:', error)
      throw error
    }
  },

  async deleteMenuItemDiscount(id) {
    if (!id) {
      throw new Error('Discount ID is required')
    }

    try {
      const response = await api.delete(`/menu-item-discount?id=${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete menu item discount')
      }

      return {
        success: true,
        message: 'Menu item discount deleted successfully'
      }
    } catch (error) {
      showApiError(error, "Failed to delete menu item discount");
      console.error('Delete menu item discount error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete menu item discount')
    }
  },

  async getBrandBranches(brandId) {
    try {
      console.log('Fetching branches for brand:', brandId)
      const response = await api.get(`/menu-item-discount/brand/${brandId}`)
      console.log('Branch API response:', response.data)

      // Check if response data exists
      if (!response.data) {
        throw new Error('No data received from API')
      }

      // Extract branches from discounts array
      const uniqueBranches = new Set()
      const branches = []

      // Check if discounts array exists and has items
      if (response.data.discounts && Array.isArray(response.data.discounts)) {
        response.data.discounts.forEach(discount => {
          if (discount.branches && Array.isArray(discount.branches)) {
            discount.branches.forEach(branchName => {
              if (!uniqueBranches.has(branchName)) {
                uniqueBranches.add(branchName)
                branches.push({
                  id: branchName,
                  branch_name: branchName,
                  brand_id: response.data.brandId
                })
              }
            })
          }
        })
      }

      console.log('Processed branches:', branches)
      return {
        success: true,
        data: branches
      }
    } catch (error) {
      showApiError(error, "Failed to fetch brand branches");
      console.error('Get brand branches error:', error)
      throw error
    }
  },

  async getMenuItemDiscount(id) {
    if (!id) {
      throw new Error('Discount ID is required')
    }

    try {
      const response = await api.get(`/menu-item-discount?id=${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch menu item discount')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to fetch menu item discount");
      console.error('Get menu item discount error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch menu item discount')
    }
  },

  async searchMenuItemDiscounts(query) {
    try {
      const response = await api.get(`/menu-item-discount/search?q=${query}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to search menu item discounts");
      console.error('Search menu item discounts error:', error)
      throw error
    }
  },

  async getBranchesForBrand(brandId) {
    try {
      const response = await api.get(`/branch?brand=${brandId}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to fetch branches for brand");
      console.error('Get branches error:', error)
      throw error
    }
  },

  async getMenuItems(brandId) {
    try {
      const response = await api.get(`/menu-item?brand=${brandId}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to fetch menu items");
      console.error('Get menu items error:', error)
      throw error
    }
  },


  async bulkAddMenuItemDiscountCodes(id, codes) {
    try {
      const response = await api.post(`/menu-item-discount/code?id=${id}`, {
        codes: codes.map(code => ({
          item_discount_code: code.item_discount_code || code
        }))
      });
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to add discount codes");
      console.error('Bulk add menu item discount codes error:', error);
      throw error
    }
  },


  async getMenuItemDiscountCode({ page = 1, limit = 10, id } = {}) {
    try {

      const response = await api.get(`/menu-item-discount/code?id=${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch menu item discount codes');
      }

      // For paginated results
      return {
        success: true,
        data: response.data.data || [],
        pagination: {
          total: response.data.data?.length || 0,
          pages: Math.ceil((response.data.data?.length || 0) / limit),
          current_page: page,
          per_page: limit
        }
      };
    } catch (error) {
      showApiError(error, "Failed to fetch menu item discount codes");
      console.error('Get menu item discount codes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch menu item discount codes');
    }
  },

  async deleteMenuItemDiscountCode(id) {
    if (!id) {
      throw new Error('Discount ID is required')
    }

    try {
      const response = await api.delete(`/menu-item-discount/code?id=${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete menu item discount code')
      }

      return {
        success: true,
        message: 'Menu item discount code deleted successfully'
      }
    } catch (error) {
      showApiError(error, "Failed to delete menu item discount code");
      console.error('Delete menu item discount code error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete menu item discount code')
    }
  },

  async updateMenuItemDiscountCode(id, data) {
    try {
      const formattedData = {
        item_discount_code: data.item_discount_code,
      }

      const response = await api.put(`/menu-item-discount/code?id=${id}`, formattedData)
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update code");
      console.error('Update code error:', error)
      throw error
    }
  },
}

