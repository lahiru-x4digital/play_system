"use client";
import React, { useEffect, useState } from "react";
import SelectBranch from "./selectBranch";
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import { useIsAdmin } from "@/lib/getuserData";
import { useSession } from "next-auth/react";
import { KIDS_ID } from "@/utils/static-variables";
import { Button } from "../ui/button";
import { FilterIcon } from "lucide-react";

export default function ReservationFilter({ onSubmit }) {
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeDurationId, setSelectedTimeDurationId] = useState("");
  const [selectedMobileNumber, setSelectedMobileNumber] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all"); // <-- Add this line
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = useIsAdmin();
  const branchId = user?.branchId;
  const { timeDurationPricing, timeDurationPricingRefres } =
    useGetTimeDurationPricing(isAdmin ? null : branchId);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const handleTimeDurationChange = (timeDurationId) => {
    setSelectedTimeDurationId(timeDurationId);
  };

  useEffect(() => {
    if (selectedBranchId) {
      timeDurationPricingRefres({ branch_id: selectedBranchId });
    }
  }, [selectedBranchId]);

  const handleFilter = () => {
    onSubmit?.({
      branch: selectedBranchId || null,
      date: selectedDate || null,
      timeDurationId: selectedTimeDurationId || null,
      mobileNumber: selectedMobileNumber || null,
      ressStatus: selectedStatus !== "all" ? selectedStatus : null, // <-- Add this line
    });
  };

  const handleReset = () => {
    setSelectedBranchId(null);
    setSelectedDate("");
    setSelectedTimeDurationId("");
    setSelectedMobileNumber(null);
    setSelectedStatus("all"); // <-- Add this line
    onSubmit?.({
      branch: null,
      date: null,
      timeDurationId: null,
      mobileNumber: null,
      ressStatus: null, // <-- Add this line
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="">
        {/* Branch */}
        <div className="flex-1 min-w-[200px] flex gap-2">
          <SelectBranch
            value={selectedBranchId}
            onChange={handleBranchChange}
            label="Branch"
          />
        </div>
        <div className="flex gap-2">
          {/* Date */}
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="end-date"
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
          {/* Duration */}
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Duration
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={selectedTimeDurationId}
              onChange={(e) => handleTimeDurationChange(Number(e.target.value))}
            >
              <option value="" disabled>
                Select duration
              </option>
              {timeDurationPricing
                .filter((p) => p.play_customer_type_id === KIDS_ID)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.duration} min - {p.price}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={selectedMobileNumber || ""}
              onChange={(e) => handleMobileNumberChange(e.target.value)}
            />
          </div>
          {/* Reservation Status */}
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Reservation Status
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="not_expired">Not Expired</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className=" text-white rounded-md"
            onClick={handleFilter}
          >
            <FilterIcon className="h-4 w-4" /> Filter
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-md"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
