import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

export const discountService = {

  // Discount Code
  async getDiscountCodes({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Text search filters
      ['name', 'code', 'description'].forEach(field => {
        if (filters[field]) {
          params.append(field, filters[field]);
        }
      });

      // Reference ID filters
      ['country', 'brand_Id', 'branch_Id'].forEach(field => {
        if (filters[field]) {
          const ids = Array.isArray(filters[field])
            ? filters[field].join(',')
            : filters[field];
          params.append(field, ids);
        }
      });

      // Amount range filters
      if (filters.min_amount) params.append('min_amount', filters.min_amount);
      if (filters.max_amount) params.append('max_amount', filters.max_amount);

      // Precentage range filters
      if (filters.min_precentage) params.append('min_precentage', filters.min_precentage);
      if (filters.max_precentage) params.append('max_precentage', filters.max_precentage);

      // Date range filters
      const dateFilters = {
        expire_date: ['min_expire', 'max_expire'],
        create_date: ['min_create_date', 'max_create_date']
      };

      Object.entries(dateFilters).forEach(([_, [minKey, maxKey]]) => {
        if (filters[minKey]) params.append(minKey, new Date(filters[minKey]).toISOString());
        if (filters[maxKey]) params.append(maxKey, new Date(filters[maxKey]).toISOString());
      });

      // Active status filter
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString());
      }

      const response = await api.get(`/discount-code?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // Extract pagination data from the response (similar to getDiscountRules)
      const pagination = response.data.pagination || {};

      // Return in consistent format
      return {
        success: true,
        data: response.data.data || [],
        total: pagination.total || 0,
        pages: pagination.totalPages || Math.ceil((pagination.total || 0) / limit),
        page: pagination.currentPage || page,
        limit: pagination.limit || limit,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false
      };
    } catch (error) {
      console.error('Get discount codes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch discount codes');
    }
  },

  async createDiscountCode(data) {
    try {

      // Ensure data is properly formatted before sending
      const cleanData = {
        name: data.name,
        code: data.code,
        description: data.description,
        emc_code: data.emc_code,
        country: Number(data.country),
        brands: data.brands.map(Number),
        branches: data.branches.map(Number),
        limit_per_customer: Number(data.limit_per_customer),
        expire_date: new Date(data.expire_date).toISOString(),
        is_active: Boolean(data.is_active),
        // is_Bulk: Boolean(data.is_Bulk),
        ...(data.amount ? { amount: Number(data.amount) } : {}),
        ...(data.percentage ? { percentage: Number(data.percentage) } : {})
      }

      const response = await api.post('/discount-code', cleanData)

      // Check if there were any failed items
      if (response.data.data.failed && response.data.data.failed.length > 0) {
        const error = response.data.data.failed[0].error
        throw new Error(error || 'Failed to create discount code')
      }

      return response.data
    } catch (error) {
      console.error('Create discount code service error:', {
        error,
        message: error.message,
        response: error.response,
        responseData: error.response?.data
      })
      throw error
    }
  },

  async getDiscountCode(id) {
    try {
      const response = await api.get(`/discount-code?id=${id}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get discount code");
      console.error('Get discount code error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch discount code')
    }
  },

  async getDiscountCodeByCode(code) {
    try {
      const response = await api.get(`/discount-code?code=${code}`)
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get discount code by code");
      console.error('Get discount code by code error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch discount code')
    }
  },

  async updateDiscountCode(id, data) {
    if (!id) {
      throw new Error('Discount code ID is required');
    }
    try {
      // Format the data according to API specifications
      const formattedData = {
        name: data.name,
        code: data.code,
        description: data.description,
        emc_code: data.emc_code,
        amount: data.amount ? Number(data.amount) : null,
        percentage: data.percentage ? Number(data.percentage) : null,
        limit_per_customer: data.limit_per_customer ? Number(data.limit_per_customer) : null,
        expire_date: data.expire_date ? new Date(data.expire_date).toISOString() : null,
        is_active: data.is_active,
        country: data.country ? Number(data.country) : null,
        brands: Array.isArray(data.brands) ? data.brands.filter(Boolean).map(Number) : [],
        branches: Array.isArray(data.branches) ? data.branches.filter(Boolean).map(Number) : []
      };

      // Remove undefined or null values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });


      // Updated endpoint format to use query parameter
      const response = await api.put(`/discount-code?id=${id}`, formattedData);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update discount code");
      console.error('Update discount code error:', error);
      throw error;
    }
  },

  async deleteDiscountCode(id) {
    if (!id) {
      throw new Error('Discount code ID is required');
    }
    try {
      // Update to use the bulk delete endpoint with a single ID
      const response = await api.delete(`/discount-code?id=${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to delete discount code");
      console.error('Delete discount code error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete discount code');
    }
  },

  async deleteDiscountCodes(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('Valid discount code IDs are required');
    }
    try {
      // Delete codes one by one since the API doesn't support bulk delete
      const deletePromises = ids.map(id =>
        api.delete(`/discount-code?id=${id}`)
      );

      const results = await Promise.all(deletePromises);

      // Check if all deletions were successful
      const failedDeletions = results.filter(result => !result.data.success);
      if (failedDeletions.length > 0) {
        throw new Error('Some codes could not be deleted');
      }

      return {
        success: true,
        message: `Successfully deleted ${ids.length} codes`
      };
    } catch (error) {
      showApiError(error, "Failed to delete discount codes");
      console.error('Delete discount codes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete discount codes');
    }
  },

  // Discount Rule
 async getDiscountRules({ page = 1, limit = 10, sortBy = 'create_date', order = 'desc', filters = {} } = {}) {

    try {
      const offset = (page - 1) * limit;

      // Build query parameters according to the new API format
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
        order
      });

      // Add search filters if provided
      // For general search, use a single search parameter that the backend can handle
      if (filters.search) {
        params.append('search', filters.search);
      }

      // For specific field searches (if needed)
      if (filters.name && !filters.search) {
        params.append('name', filters.name);
      }
      if (filters.rule_id && !filters.search) {
        params.append('rule_id', filters.rule_id);
      }
      if (filters.emc_code && !filters.search) {
        params.append('emc_code', filters.emc_code);
      }

      // Add discount type filter
      if (filters.discount_type && filters.discount_type !== 'All') {
        params.append('discount_type', filters.discount_type);
      }

      const response = await api.get(`/discount-rule?${params}`, {
        params: {
          include: 'customers,customers.customer'
        }
      });

      if (!response.data.success) {
        console.error('[Discount Service] Error in response:', response.data.message);
        throw new Error(response.data.message);
      }

      // Extract pagination data from the nested pagination object
      const pagination = response.data.pagination || {};

      // Return in consistent format
      return {
        success: true,
        data: response.data.data || [],
        total: pagination.total || 0,
        pages: pagination.totalPages || Math.ceil((pagination.total || 0) / limit),
        page: pagination.currentPage || page,
        limit: pagination.limit || limit,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false
      };
    } catch (error) {
      showApiError(error, "Failed to get discount rules");
      console.error('[Discount Service] Get discount rules error:', {
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch discount rules');
    }
  },

  async getDiscountRule(id) {
    try {
      const response = await api.get(`/discount-rule?id=${id}`);
      if (!response.data.success) {
        console.error('[Discount Service] Error in response:', response.data.message);
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to get discount rule");
      console.error(`[Discount Service] Get discount rule error (ID: ${id}):`, {
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch discount rule');
    }
  },

  async createDiscountRule(data) {
    try {
      // Handle one_time flag and its implications
      const oneTime = data.one_time === true;
      // If one_time is true, set max_uses to null, otherwise use the provided value or null
      const maxUses = oneTime ? null : (data.max_uses ? Number(data.max_uses) : null);
      // If one_time is true, set cooldown to null
      const cooldownPeriod = oneTime ? null : (data.cooldown_period || null);
      // If one_time is true, set limitation to false
      const limitation = oneTime ? false : (data.limitation !== undefined ? Boolean(data.limitation) : false);

      // Format the data according to API schema requirements
      const formattedData = {
        name: data.name,
        rule_code: data.rule_code,
        description: data.description || '',
        emc_code: data.emc_code,
        create_date: data.create_date || new Date().toISOString(),
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
        days_of_week: data.days_of_week || [],
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        amount: data.amount ? Number(data.amount) : null,
        percentage: data.percentage ? Number(data.percentage) : null,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        one_time: oneTime,
        cooldown_period: cooldownPeriod,
        limitation: limitation,
        max_uses: maxUses,
        countries: data.countries?.map(id => Number(id)) || [],
        // Format brands and branches for Prisma connect
        brands: data.brands?.map(id => Number(id)) || [],
        branches: data.branches?.map(id => Number(id)) || [],
        discountRuleTags: data.discountRuleTags || [],
        discount_rule_type: data.discount_rule_type
      };

      // Validate required fields
      if (!formattedData.name || !formattedData.rule_code) {
        const errorMsg = 'Name and rule_code are required fields';
        console.error('[Discount Service] Validation error:', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await api.post('/discount-rule', formattedData);

      if (!response.data.success) {
        console.error('[Discount Service] Error in response:', response.data.message);
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to create discount rule");
      console.error('[Discount Service] Create discount rule error:', {
        error: error.message,
        response: error.response?.data,
        stack: error.stack,
        inputData: data
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to create discount rule');
    }
  },

  async updateDiscountRule(id, data) {

    if (!id) {
      const errorMsg = 'Discount rule ID is required';
      console.error('[Discount Service] Validation error:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Handle one_time flag and its implications
      const oneTime = data.one_time === true;
      // If one_time is true, set max_uses to null, otherwise use the provided value or null
      const maxUses = oneTime ? null : (data.max_uses ? Number(data.max_uses) : null);
      // If one_time is true, set cooldown to null
      const cooldownPeriod = oneTime ? null : (data.cooldown_period || null);
      // If one_time is true, set limitation to false
      const limitation = oneTime ? false : (data.limitation !== undefined ? Boolean(data.limitation) : false);

      const formattedData = {
        name: data.name,
        rule_code: data.rule_code,
        description: data.description || '',
        emc_code: data.emc_code,
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
        days_of_week: data.days_of_week || [],
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        amount: data.amount ? Number(data.amount) : null,
        percentage: data.percentage ? Number(data.percentage) : null,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        one_time: oneTime,
        limitation: limitation,
        max_uses: maxUses,
        cooldown_period: cooldownPeriod,

        // Format brands, branches, and countries for Prisma connect
        brands: data.brands?.map(id => Number(id)) || [],
        branches: data.branches?.map(id => Number(id)) || [],
        countries: data.countries?.map(id => Number(id)) || [],
        discountRuleTags: data.discountRuleTags || [],
        discount_rule_type: data.discount_rule_type
      };


      // Use 'id' as the query parameter name to match the API endpoint expectation
      const response = await api.put(`/discount-rule?id=${id}`, formattedData);

      if (!response.data.success) {
        console.error(`[Discount Service] Error updating rule ID ${id}:`, response.data.message);
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update discount rule");
      console.error(`[Discount Service] Update discount rule error (ID: ${id}):`, {
        error: error.message,
        response: error.response?.data,
        stack: error.stack,
        inputData: data
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to update discount rule');
    }
  },

  async deleteDiscountRule(id) {

    if (!id) {
      const errorMsg = 'Discount rule ID is required';
      console.error('[Discount Service] Validation error:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const response = await api.delete(`/discount-rule?id=${id}`);

      if (!response.data.success) {
        console.error(`[Discount Service] Error deleting rule ID ${id}:`, response.data.message);
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to delete discount rule");
      console.error(`[Discount Service] Delete discount rule error (ID: ${id}):`, {
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to delete discount rule');
    }
  },

  async getBrands() {
    try {
      const response = await api.get('/brand')
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get brands");
      console.error('Get brands error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch brands')
    }
  },

  async getBranches() {
    try {
      const response = await api.get('/branch')
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get branches");
      console.error('Get branches error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch branches')
    }
  },

  async getCountries() {
    try {
      const response = await api.get('/country')
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get countries");
      console.error('Get countries error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch countries')
    }
  },

  async getCustomers() {
    try {
      const response = await api.get('/customer')
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get customers");
      console.error('Get customers error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch customers')
    }
  },

  async deleteDiscountRules(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('Valid discount rule IDs are required');
    }
    try {
      // Delete rules one by one since the API doesn't support bulk delete
      const deletePromises = ids.map(id =>
        api.delete(`/discount-rule?id=${id}`)
      );

      const results = await Promise.all(deletePromises);

      // Check if all deletions were successful
      const failedDeletions = results.filter(result => !result.data.success);
      if (failedDeletions.length > 0) {
        throw new Error('Some rules could not be deleted');
      }

      return {
        success: true,
        message: `Successfully deleted ${ids.length} rules`
      };
    } catch (error) {
      showApiError(error, "Failed to delete discount rules");
      console.error('Delete discount rules error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete discount rules');
    }
  },

  async getTags() {
    try {
      const response = await api.get('/tag')

      if (!response.data) {
        throw new Error('Failed to fetch tags')
      }

      // Transform the response using tag_name instead of name
      const transformedData = response.data.map(tag => ({
        id: tag.id,
        name: tag.tag_name,
        description: tag.description,
        customerCount: tag.customers?.length || 0
      }))

      return {
        success: true,
        data: transformedData
      }
    } catch (error) {
      showApiError(error, "Failed to get tags");
      console.error('Get tags error:', error)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to fetch tags')
    }
  },

  async getDiscountRuleTags() {
    try {
      const response = await api.get('/tag')
      return response.data
    } catch (error) {
      showApiError(error, "Failed to get discount rule tags");
      console.error('Get discount rule tags error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch discount rule tags')
    }
  },

  async createMenuItemDiscount(data) {
    try {
      // Format the data according to API requirements
      const formattedData = {
        discount_id: data.discount_id,
        discount_name: data.discount_name,
        description: data.description,
        expiry_date: new Date(data.expiry_date).toISOString(),
        countries: data.countries.map(Number),
        brands: data.brands.map(Number),
        branches: data.branches.map(Number),
        menu_items: data.menu_items.map(Number)
      };

      const response = await api.post('/menu-item-discount', formattedData);
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to create menu item discount");
      console.error('Create menu item discount error:', error);
      throw error;
    }
  },

  async bulkCreateDiscountCodes(discountId, codes) {
    try {
      const response = await api.put(`/discount-code?id=${discountId}`, {
        codes: codes.map(code => ({
          discount_code: code.discount_code,
          is_active: code.is_active,
          limit_per_customer: code.limit_per_customer
        }))
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.error('Bulk create discount codes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create discount codes in bulk');
    }
  },

  // Menu Item Discount
  async getMenuItemDiscounts({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
  
      // Text search filters
      ['discount_name', 'description', 'discount_id'].forEach(field => {
        if (filters[field]) {
          params.append(field, filters[field]);
        }
      });
  
      // Date range filters
      if (filters.start_date) {
        params.append('start_date', new Date(filters.start_date).toISOString());
      }
      if (filters.end_date) {
        params.append('end_date', new Date(filters.end_date).toISOString());
      }
      if (filters.expiry_date) {
        params.append('expiry_date', new Date(filters.expiry_date).toISOString());
      }
  
      // Status filter
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString());
      }
  
      // Discount type filter
      if (filters.discount_type) {
        params.append('discount_type', filters.discount_type);
      }
  
      // Days filter (array of DayOfWeek)
      if (filters.days && Array.isArray(filters.days) && filters.days.length > 0) {
        params.append('days', filters.days.join(','));
      }
  
      // Boolean flags
      if (filters.is_public !== undefined) {
        params.append('is_public', filters.is_public.toString());
      }
  
      // Numeric range filters
      if (filters.min_discount_value) {
        params.append('min_discount_value', filters.min_discount_value.toString());
      }
      if (filters.max_discount_value) {
        params.append('max_discount_value', filters.max_discount_value.toString());
      }
      if (filters.min_order_value) {
        params.append('min_order_value', filters.min_order_value.toString());
      }
      if (filters.max_discount_amount) {
        params.append('max_discount_amount', filters.max_discount_amount.toString());
      }
  
      // Customer-specific filters
      if (filters.customer_id) {
        params.append('customer_id', filters.customer_id);
      }
  
      const response = await api.get(`/menu-item-discount?${params}`);
      // const response = await api.get(`/menu-item-discount/code?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch menu item discounts');
      }
  
      return {
        success: true,
        data: response.data.data || [],
        pagination: {
          total: response.data.total || 0,
          pages: response.data.pages || 1,
          current_page: response.data.page || page,
          per_page: limit
        }
      };
    } catch (error) {
      console.error('Get menu item discounts error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch menu item discounts');
    }
  },

} 
