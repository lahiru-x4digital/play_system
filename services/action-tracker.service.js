import api from './api';

/**
 * Service for tracking user actions across the application
 */
const actionTrackerService = {
  /**
   * Track a new action
   * @param {string} actionType - The type of action being performed (e.g., 'reservation_created', 'customer_updated')
   * @param {object} actionData - Data related to the action
   * @param {object} options - Additional options
   * @param {number} [options.customer_id] - Associated customer ID
   * @param {number} [options.brand_id] - Associated brand ID
   * @param {number} [options.branch_id] - Associated branch ID
   * @param {number} [options.user_id] - Associated user ID
   * @returns {Promise<object>} - The created action record
   */
  trackAction: async (actionType, actionData, options = {}) => {
    try {
      const payload = {
        action_type: actionType,
        action_data: actionData,
        ...options
      };

      const response = await api.post('/action-tracker', payload);
      return response.data;
    } catch (error) {
      console.error('Error tracking action:', error);
      // Don't throw the error - we don't want tracking failures to break the app flow
      return { success: false, error: error.message };
    }
  },

  /**
   * Track a reservation update action
   * @param {number} reservationId - ID of the reservation
   * @param {object} oldData - Original reservation data
   * @param {object} newData - Updated reservation data
   * @param {object} options - Additional tracking options
   * @returns {Promise<object>} - The created action record
   */
  trackReservationUpdate: async (reservationId, oldData, newData, options = {}) => {
    const changes = {};
    
    // Compare and track only the fields that changed
    if (oldData.party_size !== newData.party_size) {
      changes.party_size = { old: oldData.party_size, new: newData.party_size };
    }
    
    if (oldData.amount !== newData.amount) {
      changes.amount = { old: oldData.amount, new: newData.amount };
    }
    
    if (oldData.start_time !== newData.start_time) {
      changes.start_time = { 
        old: oldData.start_time, 
        new: newData.start_time 
      };
    }
    
    if (oldData.end_time !== newData.end_time) {
      changes.end_time = { 
        old: oldData.end_time, 
        new: newData.end_time 
      };
    }
    
    if (oldData.notes !== newData.notes) {
      changes.notes = { old: oldData.notes, new: newData.notes };
    }
    
    if (oldData.section_id !== newData.section_id) {
      changes.section_id = { old: oldData.section_id, new: newData.section_id };
    }
    
    if (oldData.reservationStatus !== newData.reservationStatus) {
      changes.reservationStatus = { 
        old: oldData.reservationStatus, 
        new: newData.reservationStatus 
      };
    }
    
    return actionTrackerService.trackAction(
      'reservation_updated',
      {
        reservation_id: reservationId,
        changes: changes,
        change_count: Object.keys(changes).length
      },
      options
    );
  },

  /**
   * Track a reservation status change action
   * @param {number} reservationId - ID of the reservation
   * @param {string} oldStatus - Original status
   * @param {string} newStatus - New status
   * @param {object} options - Additional tracking options
   * @returns {Promise<object>} - The created action record
   */
  trackReservationStatusChange: async (reservationId, oldStatus, newStatus, options = {}) => {
    return actionTrackerService.trackAction(
      'reservation_status_changed',
      {
        reservation_id: reservationId,
        old_status: oldStatus,
        new_status: newStatus
      },
      options
    );
  }
};

export default actionTrackerService;
