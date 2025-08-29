"use client";
import { format, addMinutes, parse } from "date-fns";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
export function TimeSlotSelector({ rule, selectedDate ,onSlotSelect,kidsCount}) {
  // Mock form context for demonstration
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock rule data for demonstration
  const mockRule = rule 

  const mockSelectedDate = selectedDate || new Date().toISOString();
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  // Generate slots from rule
  const generateTimeSlots = (rule, selectedDate) => {
    console.log("out data", rule, selectedDate);

    if (!rule || !selectedDate) return [];  
    // console.log("data", rule, selectedDate);
    
    const slots = [];

    try {
      // Parse the selected date
      const dateObj = new Date(selectedDate);
      const dateStr = dateObj.toISOString().split('T')[0];
      
      // Parse start and end times
      const [startHour, startMin] = rule.start_time.split(':').map(Number);
      const [endHour, endMin] = rule.end_time.split(':').map(Number);
      
      const startDateTime = new Date(dateObj);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      const endDateTime = new Date(dateObj);
      endDateTime.setHours(endHour, endMin, 0, 0);

      let currentSlot = new Date(startDateTime);
      while (currentSlot < endDateTime) {
        const slotEnd = addMinutes(currentSlot, rule.slot_booking_period);
        if (slotEnd <= endDateTime && kidsCount<=2) {
          slots.push({
            start: new Date(currentSlot),
            end: new Date(slotEnd),
            formattedStart: formatTime(currentSlot),
            formattedEnd: formatTime(slotEnd),
            // Mock available space for demonstration
            available_space: Math.floor(Math.random() * 5) + 1
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
    if (mockRule && mockSelectedDate) {
      setIsLoading(true);
      
      // Simulate API loading time for smooth animation
      setTimeout(() => {
        const slots = generateTimeSlots(mockRule, mockSelectedDate);
        console.log(slots);
        setTimeSlots(slots);
        setSelectedSlot(null); // reset slot when rule changes
        onSlotSelect(null);
        setIsLoading(false);
      }, 800); // Adjust timing as needed
    } else {
      setTimeSlots([]);
      setSelectedSlot(null);
      onSlotSelect(null);
      setIsLoading(false);
    }
  }, [mockRule, mockSelectedDate]);

  if (!mockRule) return null;

  return (
    <motion.div 
      className="mt-8 p-6 bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h3 
        className="text-lg font-semibold mb-4 text-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        Available Time Slots
      </motion.h3>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {/* Loading skeleton */}
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.4, 0.8, 0.4],
                  scale: 1
                }}
                transition={{ 
                  opacity: { duration: 1.5, repeat: Infinity },
                  scale: { duration: 0.3, delay: index * 0.05 }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-200 h-16"
              >
                <div className="w-16 h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
                <div className="w-10 h-3 bg-gray-400 rounded animate-pulse"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="slots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            <AnimatePresence>
              {timeSlots.map((slot, index) => {
                const isSelected = selectedSlot?.start?.getTime() === slot.start.getTime();

                return (
                  <motion.button
                    key={`${slot.start.getTime()}-${index}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    layout
                    className={`
                      flex flex-col items-center justify-center p-3
                      rounded-xl border transition-all duration-300 text-center
                      relative overflow-hidden min-h-[4rem]
                      ${isSelected 
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/25 border-green-500" 
                        : "bg-white hover:bg-green-50 text-gray-700 border-gray-200 hover:border-green-200 hover:shadow-md"
                      }
                    `}
                    onClick={() => {
                      setSelectedSlot(slot) 
                      onSlotSelect({...slot,rule_id:rule?.id})
                    }}
                    aria-pressed={isSelected}
                  >
                    {/* Selection indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <>
                          {/* Animated background */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.3, type: "spring" }}
                            className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl"
                          />
                          
                          {/* Checkmark icon */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                            className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center z-20"
                          >
                            <motion.svg
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ delay: 0.2, duration: 0.3 }}
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
                            </motion.svg>
                          </motion.div>

                          {/* Pulse effect */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="absolute inset-0 bg-green-400 rounded-xl"
                          />
                        </>
                      )}
                    </AnimatePresence>

                    {/* Content with relative positioning */}
                    <div className="relative z-10">
                      {/* Time range in bold */}
                      <motion.span 
                        className="font-semibold text-sm block"
                        animate={{
                          color: isSelected ? "#ffffff" : "#374151"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {slot.formattedStart}
                      </motion.span>
                      <motion.span 
                        className="font-medium text-xs block"
                        animate={{
                          color: isSelected ? "#e0f2fe" : "#6b7280"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {slot.formattedEnd}
                      </motion.span>
                      {/* Available space / secondary info */}
                      {slot.available_space !== undefined && (
                        <motion.span 
                          className="text-xs mt-1 block"
                          animate={{
                            color: isSelected ? "#e0f2fe" : "#10b981"
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {slot.available_space} left
                        </motion.span>
                      )}
                    </div>

                    {/* Hover effect overlay */}
                    <motion.div
                      className="absolute inset-0 bg-green-500 rounded-xl opacity-0"
                      whileHover={{ opacity: isSelected ? 0 : 0.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No slots message */}
      <AnimatePresence>
        {!isLoading && timeSlots.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8 text-gray-500"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </motion.div>
            <p>No time slots available for the selected date and rule.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected slot display */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <polyline points="20,6 9,17 4,12" strokeWidth="2" stroke="none"/>
                  <path d="M20 6L9 17L4 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <div>
                <p className="text-green-800 font-semibold">
                  Selected: {selectedSlot.formattedStart} - {selectedSlot.formattedEnd}
                </p>
                <p className="text-green-600 text-sm">
                  {selectedSlot.available_space} spaces available
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}