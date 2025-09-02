"use client";
import { useState, useEffect } from "react";
import { bookingService } from "@/services/play/time_lot_generate.service";
import Select from "react-select";

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

  const options = timeSlots
    .filter((slot) => slot.available > 0)
    .map((slot) => ({
      value: `${slot.start_hour}:${String(slot.start_min).padStart(2, "0")}-${
        slot.end_hour
      }:${String(slot.end_min).padStart(2, "0")}`,
      label: `${slot.formatted} (${slot.available} Seats)`,
      ...slot,
    }));

  return (
    <div className="">
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>Loading time slots...</p>
        </div>
      ) : timeSlots.length > 0 ? (
        <div>
          <Select
            options={options}
            menuPlacement="bottom"
            className="basic-single w-96"
            classNamePrefix="select"
            isClearable={true}
            value={
              selectedSlot
                ? options.find(
                    (option) =>
                      option.start_hour === selectedSlot.start_hour &&
                      option.start_min === selectedSlot.start_min &&
                      option.end_hour === selectedSlot.end_hour &&
                      option.end_min === selectedSlot.end_min
                  ) || null
                : null
            }
            onChange={(selectedOption) => {
              onSlotSelect(
                selectedOption
                  ? {
                      rule_id: rule?.id,
                      start_hour: selectedOption.start_hour,
                      start_min: selectedOption.start_min,
                      end_hour: selectedOption.end_hour,
                      end_min: selectedOption.end_min,
                    }
                  : null
              );
            }}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No time slots available for the selected date and rule.</p>
        </div>
      )}
    </div>
  );
}
