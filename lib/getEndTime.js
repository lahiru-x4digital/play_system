// play_system/utils/getEndTime.js

/**
 * Returns the end time as a Date object or formatted string,
 * given a start time and a duration in minutes.
 * @param {Date|string|number} startTime - The start time (Date object, ISO string, or timestamp)
 * @param {number} durationMinutes - Duration in minutes
 * @returns {Date} End time as a Date object
 */
export function getEndTime(startTime, durationMinutes, extraMinutes = 0) {
  console.log(startTime, durationMinutes, extraMinutes)
    const start = new Date(startTime);
    if (isNaN(start)) throw new Error('Invalid start time');
    if (typeof durationMinutes !== 'number') throw new Error('Duration must be a number');
    return new Date(start.getTime() + (durationMinutes + extraMinutes) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }