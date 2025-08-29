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
    <div className="mt-8 p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Available Time Slots
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {timeSlots.map((slot, index) => {
          const isSelected =
            selectedSlot?.start?.getTime() === slot.start.getTime();
          return (
            <button
              key={`${slot.start.getTime()}-${index}`}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center relative overflow-hidden min-h-[4rem] ${
                isSelected
                  ? "bg-green-500 text-white shadow-lg border-green-500"
                  : "bg-white hover:bg-green-50 text-gray-700 border-gray-200 hover:border-green-200"
              }`}
              onClick={() => {
                setSelectedSlot(slot);
                onSlotSelect({ ...slot, rule_id: rule?.id });
              }}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center z-20">
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
              )}
              <div className="relative z-10">
                <span className="font-semibold text-sm block">
                  {slot.formattedStart}
                </span>
                <span className="font-medium text-xs block">
                  {slot.formattedEnd}
                </span>
                {slot.available_space !== undefined && (
                  <span className="text-xs mt-1 block text-green-600">
                    {slot.available_space} left
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {timeSlots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <p>No time slots available for the selected date and rule.</p>
        </div>
      )}
      {selectedSlot && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <polyline
                  points="20,6 9,17 4,12"
                  strokeWidth="2"
                  stroke="none"
                />
                <path
                  d="M20 6L9 17L4 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-green-800 font-semibold">
                Selected: {selectedSlot.formattedStart} -{" "}
                {selectedSlot.formattedEnd}
              </p>
              <p className="text-green-600 text-sm">
                {selectedSlot.available_space} spaces available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
