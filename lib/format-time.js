const TIME_ZONE_ID = 0;
// Extracts just the time part from an ISO string (HH:MM)
export const formatReservationTime = (timeString, reservationId) => {
  if (!timeString) return "";

  const date = new Date(timeString);
  if (isNaN(date.getTime())) return "";

  if (reservationId > TIME_ZONE_ID) {
    const timePart = timeString.split("T")[1]?.split(".")[0] || "";
    return timePart.substring(0, 5); // Returns just HH:MM
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Returns the date string as-is without conversion
export const formatReservationDate = (dateString, reservationId) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  if (reservationId > TIME_ZONE_ID) {
    return dateString.split("T")[0]; // Returns YYYY-MM-DD part
  }

  return date.toLocaleDateString();
};

// For combined date and time formatting (YYYY-MM-DD HH:MM)
export const formatReservationDateTime = (dateTimeString, reservationId) => {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return "";

  if (reservationId > TIME_ZONE_ID) {
    const [datePart, timePart] = dateTimeString.split("T");
    const time = timePart?.split(".")[0]?.substring(0, 5) || "";
    return `${datePart} ${time}`; // Returns "YYYY-MM-DD HH:MM"
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
