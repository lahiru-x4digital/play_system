"use client";
import React, { useEffect, useState } from "react";

const pad = (num) => num.toString().padStart(2, "0");

const TimerCountDown = ({
  status,
  start_hour,
  start_min,
  end_hour,
  end_min,
}) => {
  const now = new Date();

  // Build today's start and end time
  const startTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    start_hour,
    start_min,
    0,
    0
  ).getTime();

  const endTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    end_hour,
    end_min,
    0,
    0
  ).getTime();

  // Compute remaining (negative = past, positive = future)
  const getRemaining = () => {
    const now = Date.now();
    if (now < startTime) return { mode: "WAITING", ms: startTime - now };
    if (now >= startTime && now <= endTime)
      return { mode: "RUNNING", ms: endTime - now };
    return { mode: "EXPIRED", ms: now - endTime };
  };

  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [start_hour, start_min, end_hour, end_min]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  if (status === "COMPLETED") {
    return <span className="text-gray-500 font-mono text-sm">COMPLETED</span>;
  }

  if (remaining.mode === "WAITING") {
    return (
      <span className="text-blue-500 font-mono text-sm leading-none">
        Starts in {formatTime(remaining.ms)}
      </span>
    );
  }

  if (remaining.mode === "EXPIRED") {
    return (
      <span className="text-red-400 font-mono text-sm leading-none">
        -{formatTime(remaining.ms)} /{" "}
        <span className="text-red-600 font-bold uppercase text-sm leading-none">
          EXPIRED
        </span>
      </span>
    );
  }

  // RUNNING state
  const isRed = remaining.ms < 15 * 60 * 1000;
  const timerClass = isRed
    ? "text-red-500 font-mono text-sm leading-none"
    : "text-green-600 font-mono text-sm leading-none";

  return <span className={timerClass}>{formatTime(remaining.ms)}</span>;
};

export default TimerCountDown;
