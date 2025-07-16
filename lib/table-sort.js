/**
 * Configuration type for sort fields
 * @typedef {Object} SortField
 * @property {string} label - Display label for the field
 * @property {string} value - Field key in data object
 * @property {function} [comparator] - Optional custom comparison function
 */

/**
 * Default comparators for common field types
 */
export const defaultComparators = {
  string: (a, b) => {
    // Handle undefined or null values
    const aStr = a !== undefined && a !== null ? a.toString().toLowerCase() : '';
    const bStr = b !== undefined && b !== null ? b.toString().toLowerCase() : '';
    return aStr.localeCompare(bStr);
  },
  number: (a, b) => {
    // Handle undefined or null values
    const numA = a !== undefined && a !== null ? Number(a) : 0;
    const numB = b !== undefined && b !== null ? Number(b) : 0;
    return numA - numB;
  },
  date: (a, b) => {
    // Handle undefined or null values
    const dateA = a ? new Date(a).getTime() : 0;
    const dateB = b ? new Date(b).getTime() : 0;
    if (dateA === dateB) {
      // Use ID as secondary sort if available
      if (a && b && a._id && b._id) {
        return a._id > b._id ? 1 : -1;
      }
      return 0;
    }
    return dateA - dateB;
  },
  name: (a, b) => {
    // Handle undefined or null values
    const nameA = a && (a.first_name || a.last_name) ? `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase() : '';
    const nameB = b && (b.first_name || b.last_name) ? `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase() : '';
    return nameA.localeCompare(nameB);
  },
  phone: (a, b) => {
    // Handle undefined or null values
    const phoneA = a ? a.replace(/\D/g, '') : '';
    const phoneB = b ? b.replace(/\D/g, '') : '';
    return phoneA.localeCompare(phoneB);
  },
  customerId: (a, b) => {
    // Handle undefined or null values
    if (!a) return b ? -1 : 0;
    if (!b) return 1;
    
    const aNum = parseInt(a.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.replace(/\D/g, '')) || 0;
    if (aNum === bNum) {
      return a.localeCompare(b);
    }
    return aNum - bNum;
  }
}

/**
 * Sort data array based on configuration
 * @param {Array} data - Array of objects to sort
 * @param {Object} sortConfig - Sort configuration { field, direction }
 * @param {Object} fieldConfig - Field configuration with comparators
 * @returns {Array} Sorted array
 */
export function sortData(data, sortConfig, fieldConfig) {
  if (!data?.length) return []
  if (!sortConfig || !sortConfig.field) return [...data]

  return [...data].sort((a, b) => {
    const { field, direction } = sortConfig
    const config = fieldConfig?.[field]
    
    if (!config) return 0

    let result
    if (typeof config.comparator === 'function') {
      // Handle nested properties (e.g., 'customer.first_name')
      const getValue = (obj, path) => {
        if (!obj || !path) return undefined
        return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj)
      }
      
      const aValue = getValue(a, field)
      const bValue = getValue(b, field)
      
      result = config.comparator(aValue, bValue, a, b)
    } else {
      // Fallback to string comparison with null checks
      const aValue = a?.[field]
      const bValue = b?.[field]
      result = defaultComparators.string(aValue, bValue)
    }

    return direction === 'asc' ? result : -result
  })
}

/**
 * Create field configuration for sorting
 * @param {Array<SortField>} fields - Array of field configurations
 * @returns {Object} Field configuration object
 */
export function createSortFields(fields) {
  return fields.reduce((acc, field) => {
    acc[field.value] = {
      label: field.label,
      comparator: field.comparator || defaultComparators[field.type || 'string']
    }
    return acc
  }, {})
} 