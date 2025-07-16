import { showApiError } from "@/lib/apiErrorHandler";
import api from "./api";

export const bookingService = {
  async getAllSections({ page = 1, limit = 10, branch_id = null } = {}) {
    try {
      const params = {
        page,
        limit,
      };
      if (branch_id) params.branch_id = branch_id;

      const response = await api.get("booking/table-sections", { params });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          total: response.data.total,
          page: response.data.page,
          pages: response.data.pages,
        };
      } else {
        console.error("Get tables error:", error);
        return {
          success: false,
          data: [],
          error: error.message || "Failed to fetch sections",
        };
        // throw new Error(response.data.message || 'Failed to fetch sections')
      }
    } catch (error) {
      showApiError(error, "Failed to load sections");
      console.error("Get sections error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch sections"
      );
    }
  },

  async getSectionById(sectionId) {
    if (!sectionId) {
      throw new Error("Section ID is required");
    }

    try {
      const response = await api.get(`booking/table-sections?id=${sectionId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Section not found");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to load section details");
      console.error("Get section by ID error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch section details"
      );
    }
  },

  getSectionsByBranchId: async (branchId) => {
    try {
      const response = await api.get("/booking/table-sections", {
        params: { branch_id: branchId },
      });
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to load sections");
      console.error("Error fetching sections:", error);
      throw error;
    }
  },

  async createSection(data) {
    try {
      // console.log('Creating section with data:', data) // Debug log
      
      const formattedData = {
        name: data.name?.trim(),
        description: data.description?.trim(),
        branch_id: Number(data.branch_id),
        capacity: Number(data.capacity),
        availability_rule_ids: data.availability_rule_ids || [],
      };

      // Validate required fields
      if (
        !formattedData.name ||
        !formattedData.branch_id ||
        !formattedData.capacity
      ) {
        throw new Error("Name, branch ID, and capacity are required");
      }

      // console.log('Sending formatted data:', formattedData) // Debug log

      const response = await api.post("/booking/table-sections", formattedData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create section");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      showApiError(error, "Failed to create section");
      console.error("Create section error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create section"
      );
    }
  },

  async updateSection(sectionId, sectionData) {
    if (!sectionId) {
      throw new Error("Section ID is required");
    }

    try {
      // console.log('Updating section with data:', sectionData) // Debug log

      const formattedData = {
        name: sectionData.name,
        description: sectionData.description,
        branch_id: parseInt(sectionData.branch_id, 10),
        capacity: parseFloat(sectionData.capacity),
        availability_rule_ids: sectionData.availability_rule_ids,
      };

      // Remove any undefined or null values
      Object.keys(formattedData).forEach((key) => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });

      const response = await api.put(
        `booking/table-sections?id=${sectionId}`,
        formattedData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update section");
      }

      return response.data;
    } catch (error) {
      showApiError(error, "Failed to update section");
      console.error("Update section error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update section"
      );
    }
  },

  async deleteSection(sectionId) {
    if (!sectionId) {
      throw new Error("Section ID is required");
    }

    try {
      const response = await api.delete(
        `booking/table-sections?id=${sectionId}`
      );
      return response.data;
    } catch (error) {
      showApiError(error, "Failed to delete booking sections");
      console.error("Delete section error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete section"
      );
    }
  },

  // Availability Rules Methods
  async getAvailabilityRules({ section_id = null, date = null } = {}) {
    try {
      const params = {};
      if (section_id) params.section_id = section_id;
      if (date) params.date = date;

      const response = await api.get("booking/availability-rules", { params });

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
      showApiError(error, "Failed to load booking sections");
      console.error("Get availability rules error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch availability rules"
      );
    }
  },

  async getAvailabilityRuleById(ruleId) {
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

  async createAvailabilityRule(data) {
    try {
      const formattedData = {
        section_id: Number(data.section_id),
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        booking_duration: Number(data.booking_duration),
        slot_booking_period: Number(data.slot_booking_period),
        maximum_booking_per_slot: Number(data.maximum_booking_per_slot),
        buffer_time: Number(data.buffer_time || 0),
        min_party_size: Number(data.min_party_size),
        max_party_size: Number(data.max_party_size),
        price: data.price?.toString(),
        is_active: data.is_active,
        override: data.override,
        days: Array.isArray(data.days) ? data.days : [],
      };

      const response = await api.post(
        "/booking/availability-rules",
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

  async updateAvailabilityRule(ruleId, data) {
    if (!ruleId) {
      throw new Error("Rule ID is required");
    }

    try {
      const formattedData = {
        section_id: Number(data.section_id),
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        booking_duration: Number(data.booking_duration),
        slot_booking_period: Number(data.slot_booking_period),
        maximum_booking_per_slot: Number(data.maximum_booking_per_slot),
        buffer_time: Number(data.buffer_time || 0),
        min_party_size: Number(data.min_party_size),
        max_party_size: Number(data.max_party_size),
        price: data.price?.toString(),
        is_active: data.is_active,
        override: data.override,
        days: Array.isArray(data.days) ? data.days : [],
      };

      const response = await api.put(
        `booking/availability-rules?id=${ruleId}`,
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
        `booking/availability-rules?id=${ruleId}`
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
