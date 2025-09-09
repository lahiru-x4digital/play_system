

// For combined date and time formatting (YYYY-MM-DD HH:MM)
export const convertTimeZoneReservationDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '';
  
    const [datePart, timePart] = dateTimeString.split('T');
    const time = timePart?.split('.')[0]?.substring(0, 5) || '';
    return `${datePart} ${time}`; // Returns "YYYY-MM-DD HH:MM"
};
export function convertToTimeZone(date, timeZone, format = "yyyy-MM-dd HH:mm:ss") {
  const d = typeof date === "string" ? new Date(date) : date;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formatter.format(d);
}
