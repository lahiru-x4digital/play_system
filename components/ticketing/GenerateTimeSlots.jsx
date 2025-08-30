"use client";
import { format, addMinutes } from "date-fns";
import { useState, useEffect } from "react";

export function TimeSlotSelector({
  rule,
  selectedDate,
  onSlotSelect,
  kidsCount,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const generateTimeSlots = (rule, selectedDate) => {
    if (!rule || !selectedDate) return [];
    const slots = [];
    try {
      const dateObj = new Date(selectedDate);
      const [startHour, startMin] = rule.start_time.split(":").map(Number);
      const [endHour, endMin] = rule.end_time.split(":").map(Number);

      const startDateTime = new Date(dateObj);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(dateObj);
      endDateTime.setHours(endHour, endMin, 0, 0);

      let currentSlot = new Date(startDateTime);
      while (currentSlot < endDateTime) {
        const slotEnd = addMinutes(currentSlot, rule.slot_booking_period);
        if (slotEnd <= endDateTime && kidsCount <= 2) {
          slots.push({
            start: new Date(currentSlot),
            end: new Date(slotEnd),
            formattedStart: formatTime(currentSlot),
            formattedEnd: formatTime(slotEnd),
            available_space: Math.floor(Math.random() * 5) + 1,
          });
        }
        currentSlot = new Date(slotEnd);
      }
    } catch (error) {
      console.error("Error generating time slots:", error);
    }
    return slots;
  };

  useEffect(() => {
    if (rule && selectedDate) {
      const slots = generateTimeSlots(rule, selectedDate);
      setTimeSlots(slots);
      setSelectedSlot(null);
      onSlotSelect(null);
    } else {
      setTimeSlots([]);
      setSelectedSlot(null);
      onSlotSelect(null);
    }
  }, [rule, selectedDate]);

  if (!rule) return null;

  return (
    <div className="">
      {timeSlots.length > 0 ? (
        <div>
          <select
            className="w-full p-2 border rounded-lg"
            value={
              selectedSlot
                ? `${selectedSlot.start.getTime()}-${selectedSlot.end.getTime()}`
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              const slot = timeSlots.find(
                (s) => `${s.start.getTime()}-${s.end.getTime()}` === value
              );
              setSelectedSlot(slot);
              onSlotSelect(slot ? { ...slot, rule_id: rule?.id } : null);
            }}
          >
            <option value="">Select a time slot</option>
            {timeSlots.map((slot, index) => (
              <option
                key={`${slot.start.getTime()}-${index}`}
                value={`${slot.start.getTime()}-${slot.end.getTime()}`}
              >
                {slot.formattedStart} - {slot.formattedEnd} (
                {slot.available_space} left)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No time slots available for the selected date and rule.</p>
        </div>
      )}
    </div>
  );
}
