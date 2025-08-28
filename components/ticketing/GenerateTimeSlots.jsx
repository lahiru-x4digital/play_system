"use client";
import { format, addMinutes, parse } from "date-fns";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Card } from "../ui/card";
import { motion } from "framer-motion";

export function TimeSlotSelector({ rule, selectedDate }) {
  const methods = useFormContext();
  const [timeSlots, setTimeSlots] = useState([]);

  // Generate slots from rule
  const generateTimeSlots = (rule, selectedDate) => {
    //console log rule and selected date in a debug obj
    console.log("out data", rule, selectedDate);

    if (!rule || !selectedDate) return [];  
    console.log("data", rule, selectedDate);
    const { start_time, end_time, slot_booking_period } = rule;
    const slots = [];

    try {
      // Parse the selected date (assuming selectedDate is in ISO format)
      const dateObj = new Date(selectedDate);
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      
      const startDateTime = parse(`${dateStr} ${start_time}`, 'yyyy-MM-dd HH:mm', new Date());
      const endDateTime = parse(`${dateStr} ${end_time}`, 'yyyy-MM-dd HH:mm', new Date());

      let currentSlot = startDateTime;
      while (currentSlot < endDateTime) {
        const slotEnd = addMinutes(currentSlot, slot_booking_period);
        if (slotEnd <= endDateTime) {
          slots.push({
            start: new Date(currentSlot),
            end: new Date(slotEnd),
            formattedStart: format(currentSlot, 'h:mm a'),
            formattedEnd: format(slotEnd, 'h:mm a'),
          });
        }
        currentSlot = slotEnd;
      }
    } catch (error) {
      console.error("Error generating time slots:", error);
    }

    return slots;
  };

  useEffect(() => {
    console.log("s")

      const slots = generateTimeSlots(rule, selectedDate);
      console.log(slots)
      setTimeSlots(slots);
      methods.setValue("time_slot", null); // reset slot when rule changes
    
  }, [rule, selectedDate]);

  if (!rule) return null;

  return (
<div className="mt-8">
  <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {timeSlots.map((slot, index) => {
      const isSelected =
        methods.watch("time_slot")?.start?.getTime() === slot.start.getTime();

      return (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className={`
            flex flex-col items-center justify-center p-3
            rounded-xl border transition-all duration-200 text-center
            ${isSelected ? "bg-primary text-primary-foreground shadow-lg" : "bg-gray-50 hover:bg-primary/10 text-gray-700"}
          `}
          onClick={() => methods.setValue("time_slot", slot)}
          aria-pressed={isSelected}
        >
          {/* Time range in bold */}
          <span className="font-semibold text-sm">
            {slot.formattedStart} - {slot.formattedEnd}
          </span>

          {/* Available space / secondary info */}
          {slot.available_space !== undefined && (
            <span className="text-xs text-muted-foreground mt-1">
              {slot.available_space} spaces left
            </span>
          )}
        </motion.button>
      );
    })}
  </div>
</div>

  
  );
}