"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";

export function DatePicker({
  onChange,
  startDate: controlledStart,
  endDate: controlledEnd,
}) {
  const [startDate, setStartDate] = React.useState(controlledStart || "");
  const [endDate, setEndDate] = React.useState(controlledEnd || "");

  React.useEffect(() => {
    if (onChange) {
      onChange({ startDate, endDate });
    }
  }, [startDate, endDate, onChange]);

  React.useEffect(() => {
    if (controlledStart !== undefined) setStartDate(controlledStart);
  }, [controlledStart]);
  React.useEffect(() => {
    if (controlledEnd !== undefined) setEndDate(controlledEnd);
  }, [controlledEnd]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="start-date" className="px-1">
          Start Date
        </Label>
        <input
          type="date"
          id="start-date"
          className="w-48 border rounded px-2 py-1 font-normal"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="end-date" className="px-1">
          End Date
        </Label>
        <input
          type="date"
          id="end-date"
          className="w-48 border rounded px-2 py-1 font-normal"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
    </div>
  );
}
