import { showApiError } from "@/lib/apiErrorHandler";
import api from "../api";

export const bookingService = {
  // Availability Rules Methods
  async getReservationRules({ date = null, rule_id } = {}) {
    try {
      const params = {};
      if (rule_id) params.rule_id = rule_id;
      if (date) params.date = date;

      const response = await api.get("play/slot-generate", { params });
      //log response.data
      console.log(response.data);
      if (response.data.success) {
        return {
          success: true,
          data: response.data || [],
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
};
