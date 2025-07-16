/**
 * Handle API error responses
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Error>} Error with appropriate message
 */
export async function handleApiError(response) {
  try {
    const errorData = await response.json();
    return new Error(errorData.message || `API error: ${response.status}`);
  } catch (e) {
    return new Error(`API error: ${response.status}`);
  }
}

/**
 * Format API data for select components
 * @param {Array} items - Array of items to format
 * @param {string} labelKey - Key to use for label
 * @param {string} valueKey - Key to use for value
 * @returns {Array} Formatted options for select component
 */
export function formatSelectOptions(items = [], labelKey = 'name', valueKey = 'id') {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    label: item[labelKey],
    value: item[valueKey]
  }));
}
