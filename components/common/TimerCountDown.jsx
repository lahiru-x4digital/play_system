"use client";
import React, { useEffect, useState } from "react";

const pad = (num) => num.toString().padStart(2, "0");

const TimerCountDown = ({ startTime, endTime }) => {
  const end = new Date(endTime).getTime();

  // Calculate remaining time (can be negative after expiry)
  const getRemaining = () => end - Date.now();

  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Format absolute time for both positive and negative values
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  if (remaining < 0) {
    // Time past expiration
    return (
      <span className="flex flex-col items-center font-sans">
      <span className="text-red-600 font-bold uppercase text-sm leading-none">
        EXPIRED
      </span>
      <span className="text-red-400 font-mono text-sm leading-none">
        -{formatTime(remaining)}
      </span>
    </span>
    );
  }

  // Before expiration
  const isRed = remaining < 15 * 60 * 1000;
  const timerClass = isRed
    ? "text-red-500 font-mono text-sm leading-none"
    : "text-green-600 font-mono text-sm leading-none";

  return (
    <span className={timerClass}>
      {formatTime(remaining)}
    </span>
  );
};

export default TimerCountDown;
