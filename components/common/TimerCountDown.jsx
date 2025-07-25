// play_system/components/common/Timer.jsx
"use client";
import React, { useEffect, useState } from "react";

const pad = (num) => num.toString().padStart(2, "0");

const TimerCountDown = ({ startTime, duration }) => {
  // Calculate end time in ms
  const endTime = new Date(startTime).getTime() + duration * 60 * 1000;

  const getRemaining = () => Math.max(0, endTime - Date.now());

  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [startTime, duration]);

  if (remaining <= 0)
    return <span className="text-red-500 font-bold">EXPIRED</span>;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  // If less than 15 minutes, show red, else green
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
