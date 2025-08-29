import React from "react";
import { useFormContext } from "react-hook-form";

export default function BookingConfimation() {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <div className="p-6 bg-white rounded-xl border">
      <h2 className="text-xl font-bold mb-4">Booking Confirmation</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
