/**
 * Convert a UTC datetime string to local time string
 * @param {string | Date} utcDate - UTC date string or Date object
 * @param {Object} options - Optional Intl.DateTimeFormat options
 * @returns {string} Local time string, e.g., "08:30 AM" or "Aug 30, 2025, 08:30 AM"
 */
export function utcToTimeConvert(utcDate, options = {}) {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ""; // invalid date
  }

  return date.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options, // allow overriding options
  });
}

// utils/time.ts
export function extractHourMin(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return { hour: null, min: null };

  const parts = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!parts) return { hour: null, min: null };

  let hour = parseInt(parts[1], 10);
  const min = parseInt(parts[2], 10);
  const modifier = parts[3].toUpperCase();

  if (modifier === "AM" && hour === 12) hour = 0; // midnight
  if (modifier === "PM" && hour !== 12) hour += 12; // afternoon/evening

  return { hour, min };
}

export function extractHourMinFromUTC(utcStr) {
  if (!utcStr || typeof utcStr !== "string") return { hour: null, min: null };
  const date = new Date(utcStr);
  if (isNaN(date.getTime())) return { hour: null, min: null };
  return {
    hour: date.getHours(),
    min: date.getMinutes(),
  };
}

// Utility function to format hour and minute as HH:mm
export function combineHourAndMinute(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
