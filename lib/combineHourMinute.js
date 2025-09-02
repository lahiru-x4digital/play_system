// Add this at the top of your file or in a separate utils file
export function formatHourMin(hour, min) {
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
// ...existing code...
