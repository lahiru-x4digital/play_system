import { showApiError } from '@/lib/apiErrorHandler'
import api from './api'

export const menuItemService = {
  async getAllMenuItems({ page = 1, pageSize = 10, search = '', brand = '', country = '' } = {}) {
    try {
      const response = await api.get('/menu-item', {
        params: { 
          page, 
          pageSize,
          search,
          brand,
          country
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch menu items')
      }

      return {
        success: true,
        data: response.data.data || [],
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      }
    } catch (error) {
      showApiError(error, "Failed to fetch menu items");
      console.error('Error fetching menu items:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch menu items')
    }
  },

  async createMenuItem(data) {
    try {
      console.log('Creating menu item:', data);
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const response = await api.post('/menu-item', data, { headers });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create menu item');
      }

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      showApiError(error, "Failed to create menu item");
      console.error('Error creating menu item:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to create menu item');
    }
  },

  async createMenuItems(items) {
    try {
      const response = await api.post('/menu-item', items, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create menu items')
      }

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      showApiError(error, "Failed to create menu items");
      console.error('Error creating menu items:', error)
      throw new Error(error.response?.data?.message || 'Failed to create menu items')
    }
  },

  async updateMenuItem(menuItemId, data) {
    if (!menuItemId) {
        throw new Error('Menu item ID is required');
    }

    try {
        console.log('Updating menu item:', { menuItemId, data });
        
        if (!data) {
            throw new Error('Update data is required');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const response = await api.put(`/menu-item?id=${menuItemId}`, data, { headers });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update menu item');
        }

        return {
            success: true,
            data: response.data.data
        };
    } catch (error) {
      showApiError(error, "Failed to update menu item");
      console.error('Error updating menu item:', error);
      if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error(error.message || 'Failed to update menu item');
    }
},

  async deleteMenuItem(id) {
    if (!id) {
      throw new Error('Menu item ID is required')
    }

    try {
      console.log('Deleting menu item:', id);
      const response = await api.delete(`/menu-item?id=${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete menu item')
      }

      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      showApiError(error, "Failed to delete menu item");
      console.error('Error deleting menu item:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to delete menu item')
    }
  },

  async searchMenuItems(query, page = 1, limit = 10) {
    try {
      const response = await api.get('/search', {
        params: {
          type: 'menu-item',
          value: query,
          page,
          limit
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search menu items')
      }

      return response.data
    } catch (error) {
      showApiError(error, "Failed to search menu items");
      console.error('Error searching menu items:', error)
      throw new Error(error.response?.data?.message || 'Failed to search menu items')
    }
  },

  async getMenuItemsByBrand(brandId) {
    try {
      const response = await api.get(`/menu-item/brand/${brandId}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch menu items')
      }

      return {
        success: true,
        data: {
          brandId: response.data.data.brandId,
          menuItems: response.data.data.menuItems.map(item => ({
            id: item.id,
            itemCode: item.itemCode,
            name: item.itemName,
            price: item.itemPrice,
            country: item.country
          }))
        }
      }
    } catch (error) {
      showApiError(error, "Failed to fetch menu items by brand");
      console.error('Error fetching menu items by brand:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch menu items')
    }
  }
} 