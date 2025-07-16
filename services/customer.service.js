import { showApiError } from "@/lib/apiErrorHandler";
import api from "./api";
import { toast } from "@/components/ui/use-toast";

export const customerService = {
  async getAllCustomers({ page = 1, limit = 10, skip = 0, customer_type = null, branch_id = null }) {
    try {
      // console.log('Fetching customers with params:', { page, limit, skip, customer_type, branch_id });

      const params = {
        page,
        limit,
        skip: (page - 1) * limit,
      };

      // Only add customer_type to params if it's not null/undefined
      if (customer_type !== null && customer_type !== undefined) {
        params.customer_type = customer_type;
      }

      // Only add branch_id to params if it's not null/undefined
      if (branch_id !== null && branch_id !== undefined) {
        params.branch_id = branch_id;
      }

      const response = await api.get("/customer", {
        params
      });
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch customers");
      }

      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
      };
    } catch (error) {
      showApiError(error, "Failed to fetch customers");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch customers",
      };
    }
  },

  async getCustomerTypes() {
    try {
      const response = await api.get(`customer/customer-types`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch customer types");
      }

      return {
        success: true,
        data: response.data.data,
        message: "Customer types fetched successfully"
      };
    } catch (error) {
      showApiError(error, "Failed to fetch customer types");

      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch customer types",
      };
    }
  },

  async customerList() {
    try {
      // console.log('Fetching customer list');

      const response = await api.get('/customer/search');
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch customer list"
        );
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to fetch customer list");

      return {
        success: false,
        data: [],
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch customer list",
      };
    }
  },

  async createCustomer(customerData) {
    try {
      // console.log('Creating customer with data:', customerData)

      // Remove any undefined or empty values
      const formattedData = Object.fromEntries(
        Object.entries(customerData).filter(
          ([_, value]) => value !== undefined && value !== "" && value !== null
        )
      );

      // console.log('Sending formatted data:', formattedData);

      const response = await api.post('/customer', formattedData);
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create customer");
      }

      return {
        success: true,
        data: response.data.data,
        message: "Customer created successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to create customer");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create customer",
      };
    }
  },

  async updateCustomer(customerId, customerData) {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    try {
      // console.log('Updating customer with data:', customerData)

      // Remove any undefined or empty values
      const formattedData = Object.fromEntries(
        Object.entries(customerData).filter(
          ([_, value]) => value !== undefined && value !== "" && value !== null
        )
      );

      // console.log('Sending formatted data:', formattedData);

      const response = await api.put(`/customer?id=${customerId}`, formattedData);
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update customer");
      }

      return {
        success: true,
        data: response.data.data,
        message: "Customer updated successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to update customer");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update customer",
      };
    }
  },

  async deleteCustomers(customerIds) {
    if (!customerIds || customerIds.length === 0) {
      throw new Error("Customer IDs are required");
    }

    try {
      // console.log('Deleting customers with IDs:', customerIds);

      const response = await api.delete("/customer", {
        data: { ids: customerIds },
      });
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete customers");
      }

      return {
        success: true,
        data: response.data.data,
        message: "Customers deleted successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to delete customers");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete customers",
      };
    }
  },

  async deleteCustomer(id) {
    if (!id) {
      throw new Error("Customer ID is required");
    }

    try {
      // console.log('Deleting customer with ID:', id);

      const response = await api.delete(`/customer?id=${id}`);
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete customer");
      }

      return {
        success: true,
        data: response.data.data,
        message: "Customer deleted successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to delete customer");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete customer",
      };
    }
  },

  async searchCustomerByMobile(mobileNumber) {
    try {
      // console.log('Searching customer by mobile number:', mobileNumber);

      // Remove any formatting (spaces, dashes, plus signs)
      const cleanMobileNumber = mobileNumber.replace(/[\s\-\+]/g, "");

      // Make sure we have a valid mobile number to search for
      if (!cleanMobileNumber || cleanMobileNumber.length < 3) {
        return {
          success: false,
          data: { customers: [] },
          message: "Please enter a valid mobile number",
        };
      }

      // First try the search endpoint
      let response;
      try {
        response = await api.get('/customer/search', {
          params: {
            mobile_number: cleanMobileNumber
          }
        });
        // console.log('Search API response:', response.data);

        // If search endpoint returns customers, return them
        if (response.data?.data?.customers?.length > 0) {
          return {
            success: true,
            data: {
              customers: response.data.data.customers,
              pagination: response.data.data.pagination || {
                total: response.data.data.customers.length,
                page: 1,
                pages: 1
              }
            },
            message: 'Customer found successfully'
          };
        }
      } catch (searchError) {
        // console.log('Search endpoint failed, falling back to list endpoint:', searchError);
      }

      // If search endpoint fails or returns no results, try the list endpoint
      response = await api.get('/customer', {
        params: {
          mobile_number: cleanMobileNumber,
        },
      });

      // console.log('List API response for mobile search:', response.data);

      // Handle successful API response
      if (response.data && response.data.success) {
        const customerData = response.data.data;

        // If data is an array, use it directly, otherwise wrap in array
        const customers = Array.isArray(customerData) ? customerData : [customerData].filter(Boolean);

        return {
          success: true,
          data: {
            customers: customers,
            pagination: {
              total: customers.length,
              page: 1,
              pages: 1,
            },
          },
          message: "Customer found successfully",
        };
      } else {
        throw new Error(response.data?.message || "Customer not found");
      }
    } catch (error) {
      showApiError(error, "Failed to search customer");

      // Better error handling including 404 responses
      if (error.response?.status === 404) {
        return {
          success: false,
          data: {
            customers: [],
            pagination: {
              total: 0,
              page: 1,
              pages: 1,
            },
          },
          message: "Customer not found",
        };
      }

      // General error handler
      return {
        success: false,
        data: { customers: [] },
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to search customer",
      };
    }
  },

  async getBranches() {
    try {
      // console.log('Fetching branches');

      const response = await api.get('/branch');
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch branches");
      }

      return {
        success: true,
        data: response.data.data,
        message: "Branches fetched successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to fetch branches");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch branches",
      };
    }
  },

  async getCustomerById(customerId) {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    try {
      // console.log('Fetching customer by ID:', customerId);

      // Get the customer details which already include discount rules
      const response = await api.get(`/customer?id=${customerId}`);
      // console.log('Customer API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Customer not found");
      }

      // Format the discount rules to match the expected structure
      const discountRules = response.data.data.discountRules || [];

      // Transform the rules to match the expected format
      const formattedDiscountRules = discountRules.map((rule) => ({
        ...rule.rule, // Spread the rule details
        customers: [
          {
            customer_id: response.data.data.id,
            availability: rule.availability,
            last_used: rule.last_used,
            remaining_uses: rule.remaining_uses,
          },
        ],
      }));

      // Update the customer data with the formatted rules
      const customerData = {
        ...response.data.data,
        discountRules: formattedDiscountRules,
      };

      return {
        success: true,
        data: customerData,
        message: "Customer found successfully with discount rules",
      };
    } catch (error) {

      showApiError(error, "Failed to load customer details");
      if (error.response?.status === 404) {
        return {
          success: false,
          message: "Customer not found",
        };
      }
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch customer details",
      };
    }
  },

  async getTags() {
    try {
      // console.log('Fetching tags');

      const response = await api.get('/tag');
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch tags");
      }

      // Transform the response using tag_name instead of name
      const transformedData = response.data.data.map((tag) => ({
        id: tag.id,
        name: tag.tag_name,
        description: tag.description,
        customerCount: tag.customers?.length || 0,
      }));

      // console.log('Transformed tags:', transformedData);

      return {
        success: true,
        data: transformedData,
        message: "Tags fetched successfully",
      };
    } catch (error) {

      showApiError(error, "Failed to load tags");

      if (error.response?.data?.error) {
        return {
          success: false,
          message: error.response.data.error,
        };
      }
      return {
        success: false,
        message: "Failed to fetch tags",
      };
    }
  },

  async getDiscountRules() {
    try {
      // console.log('Fetching discount rules');

      const response = await api.get('/discount-rule');
      // console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch discount rules"
        );
      }

      return {
        success: true,
        data: response.data.data,
        message: "Discount rules fetched successfully",
      };
    } catch (error) {

      showApiError(error, "Failed to load discount rules");
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch discount rules",
      };
    }
  },

  async getCustomerProfileCompletion(customerId) {
    try {
      const response = await api.get(
        `/customer/profile-completion?customer_id=${customerId}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch customer profile completion"
        );
      }

      return {
        success: true,
        data: response.data.data,
        message: "Customer profile completion fetched successfully",
      };
    } catch (error) {

      showApiError(error, "Failed to load customer profile completion");
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch customer profile completion",
      };
    }
  },

  async getAvarageCustomerProfileCompletion(startDate, endDate, timeRange, country, brand, branch) {
    try {
      let url = "/customer/profile-completion";
      const params = new URLSearchParams();

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (timeRange) params.append('time_range', timeRange);
      if (country) params.append('country', country);
      if (brand) params.append('brand', brand);
      if (branch) params.append('branch', branch);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
          "Failed to fetch average customer profile completion"
        );
      }

      return {
        success: true,
        data: response.data.data,
        message: "Average customer profile completion fetched successfully",
      };
    } catch (error) {

      showApiError(error, "Failed to load average customer profile completion");
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch average customer profile completion",
      };
    }
  },

  async getAvarageEmailCompletion(startDate, endDate, timeRange, country, brand, branch) {
    try {
      let url = "/customer/email-completion";
      const params = new URLSearchParams();

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (timeRange) params.append('time_range', timeRange);
      if (country) params.append('country', country);
      if (brand) params.append('brand', brand);
      if (branch) params.append('branch', branch);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch average email completion"
        );
      }

      return {
        success: true,
        data: response.data.data,
        message: "Average email completion fetched successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to load average email completion");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch average email completion",
      };
    }
  },

  async getAvarageBirthdayCompletion(startDate, endDate, timeRange, country, brand, branch) {
    try {
      let url = "/customer/birthday-completion";
      const params = new URLSearchParams();

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (timeRange) params.append('time_range', timeRange);
      if (country) params.append('country', country);
      if (brand) params.append('brand', brand);
      if (branch) params.append('branch', branch);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch average birthday completion"
        );
      }

      return {
        success: true,
        data: response.data.data,
        message: "Average birthday completion fetched successfully",
      };
    } catch (error) {
      showApiError(error, "Failed to load average birthday completion");

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch average birthday completion",
      };
    }
  },

  /**
   * Update a customer's discount rule with new availability and remaining uses
   * @param {number} customerId - ID of the customer
   * @param {number} ruleId - ID of the discount rule (or 'all' to update all rules)
   * @param {Object} updateData - Update data
   * @param {boolean} [updateData.availability] - Whether the discount is available
   * @param {number} [updateData.remaining_uses] - Number of remaining uses
   * @param {string} [updateData.eventType] - Special event type (e.g., 'reset Discount Rules availability')
   * @returns {Promise<Object>} - Updated customer data
   */
  async updateCustomerDiscountRule(customerId, ruleId, updateData) {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    // If eventType is 'reset Discount Rules availability', we can proceed without ruleId
    if (
      !ruleId &&
      (!updateData ||
        updateData.eventType !== "reset Discount Rules availability")
    ) {
      throw new Error("Rule ID is required or eventType must be specified");
    }

    try {
      console.log(`Updating customer ${customerId} discount rule ${ruleId} with data:`, updateData);

      // Handle reset discount rule event
      if (updateData?.eventType === 'reset Discount Rules availability') {
        console.log(`[CustomerService] Resetting discount rule for customer ${customerId} with rule code: ${updateData.rule_code}`);

        // First get the customer to get mobile number
        const customerResponse = await this.getCustomerById(customerId);
        if (!customerResponse.success) {
          throw new Error(
            customerResponse.message || "Failed to fetch customer data"
          );
        }

        const mobileNumber = customerResponse.data?.mobile_number;
        if (!mobileNumber) {
          throw new Error("Customer mobile number not found");
        }

        // Call the API with mobile number in query params
        const response = await api.put(
          `/customer?mobile_number=${mobileNumber}`,
          {
            eventType: "reset Discount Rules availability",
            rule_code: updateData.rule_code,
          }
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to reset discount rule"
          );
        }

        return response.data;
      }

      // Handle single rule update
      const customerResponse = await this.getCustomerById(customerId);
      if (!customerResponse.success) {
        throw new Error(
          customerResponse.message || "Failed to fetch customer data"
        );
      }

      const customer = customerResponse.data;

      // Update all rules if ruleId is 'all', otherwise find the specific rule
      const updatedDiscountRules = customer.discountRules.map((rule) => {
        const isTargetRule =
          ruleId === "all" ||
          rule.ruleId === ruleId ||
          rule.rule?.id === ruleId;
        if (isTargetRule) {
          // console.log(`[CustomerService] Updating rule ${rule.ruleId || rule.rule?.id} for customer ${customerId}`);
          return {
            ...rule,
            availability: updateData.availability !== undefined
              ? updateData.availability
              : rule.availability,
            remaining_uses: updateData.remaining_uses !== undefined
              ? updateData.remaining_uses
              : rule.remaining_uses
          };
        }
        return rule;
      });

      // Update the customer with the modified discount rules
      const response = await this.updateCustomer(customerId, {
        discountRules: updatedDiscountRules
          .filter(rule => ruleId === 'all' || rule.ruleId === ruleId || rule.rule?.id === ruleId)
          .map(rule => ({
            ruleId: rule.ruleId || rule.rule?.id,
            availability: updateData.availability !== undefined
              ? updateData.availability
              : rule.availability,
            remaining_uses: updateData.remaining_uses !== undefined
              ? updateData.remaining_uses
              : rule.remaining_uses
          }))
      });

      if (!response.success) {
        throw new Error(
          response.message || "Failed to update customer discount rule"
        );
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update customer discount rule");
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update customer discount rule",
      };
    }
  },

  async searchCustomerByMobile(mobileNumber) {
    try {
      const response = await api.get(`/customer/search?mobile_number=${encodeURIComponent(mobileNumber)}`);
      // console.log('Raw API response:', response.data);

      // Ensure the response has the expected structure
      if (response.data && response.data.success) {
        // If we have customers in the response, return them
        if (response.data.data?.customers) {
          return response.data;
        }
        // If we have data directly in the response, wrap it in a customers array
        if (response.data.data) {
          return {
            ...response.data,
            data: {
              customers: Array.isArray(response.data.data) ? response.data.data : [response.data.data]
            }
          };
        }
      }

      // If we get here, the response doesn't have the expected structure
      console.warn('Unexpected API response format:', response.data);
      return {
        success: false,
        message: 'Unexpected response format',
        data: { customers: [] }
      };
    } catch (error) {
      // Handle 404 as a non-error case (customer not found)
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Customer not found',
          data: { customers: [] }
        };
      }
      console.error('Search customer by mobile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to search customer',
        data: { customers: [] }
      };
    }
  }
}