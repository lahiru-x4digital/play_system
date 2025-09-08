import api from "../api";

export const playReservationService = {
  /**
   * Fetch all play reservations.
   */
  async getPlayReservations(params = {}) {
    try {
      const response = await api.get("/play/play-reservation", { params });
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch reservations"
        );
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservations"
      );
    }
  },

  /**
   * Fetch a single play reservation by ID.
   */
  async getPlayReservationById(id) {
    try {
      const response = await api.get(`/play/play-reservation/${id}`);
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch reservation");
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservation"
      );
    }
  },

  /**
   * Update a play reservation by ID.
   */
  async updatePlayReservation({ id, payload }) {
    console.log("Updating reservation:", id, payload);
    try {
      const response = await api.patch(`/play/play-reservation/${id}`, payload);
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new Error(
          response.data.message || "Failed to update reservation"
        );
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update reservation"
      );
    }
  },

  /**
   * Create a new play reservation.
   */
  async createPlayReservation(payload) {
    try {
      const response = await api.post("/play/auto-booking", payload);
      if (response.data.success) {
        console.log(response);
        return {
          success: true,
          data: response.data.playReservation,
        };
      } else {
        throw new Error(
          response.data.message || "Failed to create reservation"
        );
      }
    } catch (error) {
      showApiError(error, "Failed to create Play Reservation");
      throw new Error(
        error.response?.data?.message || "Failed to create reservation"
      );
    }
  },
  /**
   * Delete a play reservation by ID.
   */
  async deletePlayReservation(id) {
    try {
      const response = await api.delete(`/play/play-reservation/${id}`);
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new Error(
          response.data.message || "Failed to delete reservation"
        );
      }
    } catch (error) {
      showApiError(error, "Failed to delete Play Reservation");
      throw new Error(
        error.response?.data?.message || "Failed to delete reservation"
      );
    }
  },
};
