import api from './api';
import { format } from 'date-fns';

export const waitingListService = {
  async getWaitingListReport(startDate, endDate, duration = '30m') {
    try {
      console.log('Fetching waiting list report with params:', {
        startDate,
        endDate,
        duration
      });

      // Make the API call
      const response = await api.get('/booking/waiting-list/report', {
        params: {
          start_date: startDate,
          end_date: endDate,
          duration: duration
        }
      });

      // console.log('Waiting List API Response:', response.data);

      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        throw new Error('API response missing success flag or data');
      }

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('Get waiting list report error:', error);
      throw error;
    }
  },

  // Helper methods
  getDurationInMinutes(duration) {
    const durationMap = {
      '30m': 30,
      '1h': 60,
      '2h': 120,
      '3h': 180,
      '4h': 240,
      '5h': 300,
      '6h': 360
    };
    return durationMap[duration] || 30;
  },

  formatTimeRange(startTime, endTime) {
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  },

  // Utility method to get yesterday's date in YYYY-MM-DD format
  getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, 'yyyy-MM-dd');
  },

  // Utility method to format date for API
  formatDateForAPI(date) {
    return format(new Date(date), 'yyyy-MM-dd');
  },

  // Validate duration options
  isValidDuration(duration) {
    const validDurations = ['30m', '1h', '2h', '3h', '4h', '5h', '6h'];
    return validDurations.includes(duration);
  },

  // Get duration options for frontend dropdown
  getDurationOptions() {
    return [
      { value: "30m", label: "30 min" },
      { value: "1h", label: "1 hour" },
      { value: "2h", label: "2 hours" },
      { value: "3h", label: "3 hours" },
      { value: "4h", label: "4 hours" },
      { value: "5h", label: "5 hours" },
      { value: "6h", label: "6 hours" }
    ];
  }
};