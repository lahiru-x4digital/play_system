"use client";
import { useState, useEffect } from "react";
import { bookingService } from "@/services/play/time_lot_generate.service";

export function TimeSlotSelector({
  rule,
  selectedDate,
  onSlotSelect,
  kidsCount,
  selectedSlot,
}) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSlots() {
      if (!rule || !selectedDate) {
        setTimeSlots([]);
        onSlotSelect(null);
        return;
      }
      setLoading(true);
      try {
        const res = await bookingService.getReservationRules({
          rule_id: rule.id,
          date: selectedDate,
        });
        console.log("Ress", res);
        // Correctly set timeSlots from response
        const slots = res.data.slots || [];
        setTimeSlots(slots);

        // Auto-select matching slot based on current time
        const now = new Date();
        const matchingSlot = slots.find((slot) => {
          if (slot.available <= 0) return false;
          const slotStart = new Date(selectedDate);
          slotStart.setHours(slot.start_hour, slot.start_min, 0, 0);
          const slotEnd = new Date(selectedDate);
          slotEnd.setHours(slot.end_hour, slot.end_min, 0, 0);
          return now >= slotStart && now <= slotEnd;
        });

        if (matchingSlot) {
          onSlotSelect({
            rule_id: rule?.id,
            start_hour: matchingSlot.start_hour,
            start_min: matchingSlot.start_min,
            end_hour: matchingSlot.end_hour,
            end_min: matchingSlot.end_min,
          });
        } else {
          onSlotSelect(null);
        }
      } catch (error) {
        setTimeSlots([]);
        onSlotSelect(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [rule, selectedDate]);

  if (!rule) return null;

  const availableSlots = timeSlots.filter((slot) => slot.available > 0);

  const getCurrentSelectedValue = () => {
    if (!selectedSlot) return "";
    return `${selectedSlot.start_hour}:${selectedSlot.start_min}:${selectedSlot.end_hour}:${selectedSlot.end_min}`;
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (!value) {
      onSlotSelect(null);
      return;
    }

    const [startHour, startMin, endHour, endMin] = value.split(":").map(Number);
    onSlotSelect({
      rule_id: rule?.id,
      start_hour: startHour,
      start_min: startMin,
      end_hour: endHour,
      end_min: endMin,
    });
  };

  return (
    <div className="">
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>Loading time slots...</p>
        </div>
      ) : timeSlots.length > 0 ? (
        <div>
          <select
            value={getCurrentSelectedValue()}
            onChange={handleSelectChange}
            className="w-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Select a time slot</option>
            {availableSlots.map((slot) => (
              <option
                key={`${slot.start_hour}:${slot.start_min}:${slot.end_hour}:${slot.end_min}`}
                value={`${slot.start_hour}:${slot.start_min}:${slot.end_hour}:${slot.end_min}`}
              >
                {slot.formatted} ({slot.available} Seats)
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
