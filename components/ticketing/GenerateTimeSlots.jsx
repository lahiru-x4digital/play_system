"use client";
import { useState, useEffect } from "react";
import { bookingService } from "@/services/play/time_lot_generate.service";
import Select from "react-select";

export function TimeSlotSelector({
  rule,
  selectedDate,
  onSlotSelect,
  kidsCount,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log(timeSlots);
  useEffect(() => {
    async function fetchSlots() {
      if (!rule || !selectedDate) {
        setTimeSlots([]);
        setSelectedSlot(null);
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
        setTimeSlots(res.data.slots || []);
        setSelectedSlot(null);
        onSlotSelect(null);
      } catch (error) {
        setTimeSlots([]);
        setSelectedSlot(null);
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
            onChange={(selectedOption) => {
              const slot = timeSlots.find(
                (s) =>
                  `${s.start_hour}:${String(s.start_min).padStart(2, "0")}-${
                    s.end_hour
                  }:${String(s.end_min).padStart(2, "0")}` ===
                  selectedOption?.value
              );
              setSelectedSlot(slot);
              onSlotSelect(
                slot
                  ? {
                      rule_id: rule?.id,
                      start_hour: slot.start_hour,
                      start_min: slot.start_min,
                      end_hour: slot.end_hour,
                      end_min: slot.end_min,
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
