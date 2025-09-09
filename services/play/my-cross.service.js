import api from "@/services/api";

export const myCross = {
  async getMyCross(branchId) {
    if (!branchId) {
      throw new Error("Branch ID is required");
    }
    try {
      const response = await api.get(`branch/my-cross?branchId=${branchId}`);
      if (response.status !== 200) {
        throw new Error(response.data?.error || "Branch not found");
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      showApiError(error, "Failed to load branch cross details");
      console.error("Get branch cross error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch branch cross details"
      );
    }
  },

  async updateMyCross({ branchId, payload }) {
    if (!branchId) {
      throw new Error("Branch ID is required");
    }
    const data = { ...payload, branchId };
    try {
      const response = await api.put(`branch/my-cross`, data);
      if (response.status !== 200) {
        throw new Error(
          response.data?.error || "Failed to update branch cross details"
        );
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      showApiError(error, "Failed to update branch cross details");
      console.error("Update branch cross error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update branch cross details"
      );
    }
  },

  // Payment Methods Services
  async getPaymentMethods(branchId) {
    if (!branchId) {
      throw new Error("Branch ID is required");
    }
    try {
      const response = await api.get(
        `branch/my-cross/payment-methods?branchId=${branchId}`
      );
      if (response.status !== 200) {
        throw new Error(
          response.data?.error || "Failed to fetch payment methods"
        );
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to load payment methods");
      throw error;
    }
  },

  async addPaymentMethod({ method_name, code, branch_id }) {
    if (!method_name || !code || !branch_id) {
      throw new Error("method_name, code, and branch_id are required");
    }
    try {
      const response = await api.post(`branch/my-cross/payment-methods`, {
        method_name,
        code,
        branch_id: parseInt(branch_id),
      });
      if (response.status !== 201) {
        throw new Error(response.data?.error || "Failed to add payment method");
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to add payment method");
      throw error;
    }
  },

  async updatePaymentMethod({ id, method_name, code }) {
    if (!id) {
      throw new Error("id is required");
    }
    try {
      const response = await api.put(`branch/my-cross/payment-methods`, {
        id,
        method_name,
        code,
      });
      if (response.status !== 200) {
        throw new Error(
          response.data?.error || "Failed to update payment method"
        );
      }
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update payment method");
      throw error;
    }
  },
};
