// Service for interacting with the action-tracker-with-type API

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetch actions by type and user_type
 * @param {string} actionType - The action_type to filter (e.g., 'reservation')
 * @param {string} userType - The user_type to filter (e.g., 'USER')
 * @returns {Promise<Array>} - Array of action records
 */
export async function fetchActionsByTypeAndUserType(actionType, userType) {
  try {
    const res = await fetch(`${API_URL}/action-tracker-with-type?action_type=${encodeURIComponent(actionType)}&user_type=${encodeURIComponent(userType)}`);
    if (!res.ok) throw new Error('Failed to fetch actions');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching actions:', error);
    throw error;
  }
}
