"use client";
import React, { useEffect, useState } from "react";

// Pad numbers like 9 -> "09"
const pad = (num) => num.toString().padStart(2, "0");

const TimerCountDown = ({ startTime, endTime }) => {
  // Parse the ISO strings into timestamps (ms)
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  const getRemaining = () => Math.max(0, end - Date.now());

  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  if (remaining <= 0) {
    return <span className="text-red-500 font-bold">EXPIRED</span>;
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  // Change color based on time left
  const isRed = remaining < 15 * 60 * 1000;
  const timerClass = isRed
    ? "text-red-500 font-bold"
    : "text-green-600 font-bold";

  return (
    <span className={timerClass}>
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
};

export default TimerCountDown;
