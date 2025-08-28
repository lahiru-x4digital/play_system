import { showApiError } from "@/lib/apiErrorHandler";
import api from "./api";

export const bookingService = {


  async getReservationRuleById(ruleId) {
    if (!ruleId) {
      throw new Error("Section ID is required");
    }

    try {
      const response = await api.get(`booking/table-sections?id=${ruleId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "ruleId not found");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to load rule details");

      throw new Error(
        error.response?.data?.message || "Failed to fetch section details"
      );
    }
  },

  // Availability Rules Methods
  async getReservationRules({ branch_id = null, date = null } = {}) {
    try {
      const params = {};
      if (branch_id) params.branch_id = branch_id;
      if (date) params.date = date;

      const response = await api.get("play/reservation-rules", { params });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch availability rules"
        );
      }
    } catch (error) {
      showApiError(error, "Failed to load Reservation Rules");
      console.error("Get availability rules error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch availability rules"
      );
    }
  },

  async getReservationRuleById(ruleId) {
    if (!ruleId) {
      throw new Error("Rule ID is required");
    }

    try {
      const response = await api.get(`booking/availability-rules?id=${ruleId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Rule not found");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to load booking sections");
      console.error("Get rule by ID error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch rule details"
      );
    }
  },

  async createReservationRule(data) {
    try {
      const formattedData = {
        branch_id: Number(data.branch_id),
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        slot_booking_period: Number(data.slot_booking_period),
        maximum_booking_per_slot: Number(data.maximum_booking_per_slot),
        price: data.price?.toString(),
        is_active: data.is_active,
        override: data.override,
        days: Array.isArray(data.days) ? data.days : [],
      };

      const response = await api.post(
        "/play/reservation-rules",
        formattedData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create rule");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to create booking rule");
      console.error("Create rule error:", error);
      throw new Error(error.response?.data?.message || "Failed to create rule");
    }
  },

  async updateReservationRule(ruleId, data) {
    if (!ruleId) {
      throw new Error("Rule ID is required");
    }

    try {
      const formattedData = {
        branch_id: Number(data.branch_id),
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        slot_booking_period: Number(data.slot_booking_period),
        maximum_booking_per_slot: Number(data.maximum_booking_per_slot),
        price: data.price?.toString(),
        is_active: data.is_active,
        override: data.override,
        days: Array.isArray(data.days) ? data.days : [],
      };

      const response = await api.put(
        `play/reservation-rules?id=${ruleId}`,
        formattedData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update rule");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to update booking rule");
      console.error("Update rule error:", error);
      throw new Error(error.response?.data?.message || "Failed to update rule");
    }
  },

  async deleteAvailabilityRule(ruleId) {
    if (!ruleId) {
      throw new Error("Rule ID is required");
    }

    try {
      const response = await api.delete(
        `play/reservation-rules?id=${ruleId}`
      );
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to delete booking rule");
      console.error("Delete availability rule error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete availability rule"
      );
    }
  },
};
