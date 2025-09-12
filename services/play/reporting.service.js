/**
 * playReservationsService provides methods to fetch play reservations with pagination and filtering.
 * It interacts with the play/time-tracking API and handles errors and parameter management.
 */
import { extractErrorMessage } from "@/utils/extractErrorMessage";
import api from "@/services/api";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import axios from "axios";

export const playReportingService = {
  /**
   * Fetch play reservations with pagination and filters.
   * @param {Object} params - Query parameters for the API.
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation.
   * @returns {Promise<{data: Array, total: number}>}
   */
  async fetchReservations({ params = {}, signal }) {
    try {
      const response = await api.get("play/report/time-tracking", {
        params: {
          ...paramsNullCleaner(params),

          limit: params.pageSize,
        },
        signal,
      });
      console.log({ "play/report/time-tracking": response.data });

      return {
        ...response.data,
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
