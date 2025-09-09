/**
 * playReservationsService provides methods to fetch play reservations with pagination and filtering.
 * It interacts with the play/time-tracking API and handles errors and parameter management.
 */
import { extractErrorMessage } from "@/utils/extractErrorMessage";
import api from "@/services/api";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import axios from "axios";

export const playReservationsService = {
  /**
   * Fetch play reservations with pagination and filters.
   * @param {Object} params - Query parameters for the API.
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation.
   * @returns {Promise<{data: Array, total: number}>}
   */
  async fetchReservations(params = {}, signal) {
    try {
      const response = await api.get("play/time-tracking", {
        params: {
          ...paramsNullCleaner(params),
          skip: (params.page - 1) * params.pageSize,
          limit: params.pageSize,
        },
        signal,
      });
      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
      };
    } catch (err) {
      if (axios.isCancel(err)) {
        return { data: [], total: 0, cancelled: true };
      }
      extractErrorMessage(err);
      throw err;
    }
  },
};
