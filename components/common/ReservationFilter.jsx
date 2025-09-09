"use client";
import React, { useState } from "react";
import SelectBranch from "./selectBranch";
import { useIsAdmin } from "@/lib/getuserData";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { FilterIcon } from "lucide-react";

export default function ReservationFilter({ onSubmit, onExport }) {
  const statuses = ["PAID", "COMPLETED", "WENT_OUTSIDE", "CONFIRMED", "ALL"];
  const [reservationStatus, setReservationStatus] = React.useState("ALL");

  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedMobileNumber, setSelectedMobileNumber] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all"); // <-- Add this line
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = useIsAdmin();
  const branchId = user?.branchId;

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleFilter = () => {
    onSubmit?.({
      branch: selectedBranchId || null,
      date: selectedDate || null,
      mobileNumber: selectedMobileNumber || null,
      ressStatus: selectedStatus !== "all" ? selectedStatus : null, // <-- Add this line
      reservationStatus: reservationStatus !== "ALL" ? reservationStatus : null,
      endDate: selectedEndDate || null,
    });
  };
  const handleExport = () => {
    onExport?.({
      branch: selectedBranchId || null,
      date: selectedDate || null,
      endDate: selectedEndDate || null,
      mobileNumber: selectedMobileNumber || null,
      ressStatus: selectedStatus !== "all" ? selectedStatus : null, // <-- Add this line
      reservationStatus: reservationStatus !== "ALL" ? reservationStatus : null,
    });
  };
  const handleReset = () => {
    setSelectedBranchId(null);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedEndDate(new Date().toISOString().split("T")[0]);

    setSelectedMobileNumber(null);
    setSelectedStatus("all"); // <-- Add this line
    onSubmit?.({
      branch: null,
      date: null,
      endDate: null,
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
        <div className="flex flex-wrap gap-2">
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
          {/* End Date */}
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={selectedEndDate}
              onChange={(e) => setSelectedEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
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
              value={reservationStatus}
              onChange={(e) => setReservationStatus(e.target.value)}
            >
              {statuses.map((statusItem) => (
                <option key={statusItem} value={statusItem}>
                  {statusItem}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Status
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
          <Button
            size="sm"
            variant="outline"
            className="rounded-md"
            onClick={handleExport}
          >
            Export to Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
