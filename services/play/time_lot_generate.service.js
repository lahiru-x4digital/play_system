/**
 * bookingService provides methods to interact with the slot generation API for play reservations.
 * It allows fetching available reservation slots based on rule ID and date
 */
import { showApiError } from "@/lib/apiErrorHandler";
import api from "@/services/api";

export const bookingService = {
  // Fetch available reservation slots for a given rule and date
  async getReservationRules({
    date = null,
    rule_id = null,
    branch_id = null,
  } = {}) {
    try {
      const params = {};
      if (rule_id) params.rule_id = rule_id;
      if (date) params.date = date; // format to YYYY-MM-DD
      if (branch_id) params.branch_id = branch_id;

      const response = await api.get("play/slot-generate", { params });

      // console.log("play/slot-generate", response.data);
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
