"use client";
import React, { useState } from "react";
import SelectBranch from "./selectBranch";
import { Button } from "../ui/button";
import { FilterIcon } from "lucide-react";

export default function PaymentFilter({ onSubmit, onExport }) {
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All");

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleFilter = () => {
    onSubmit?.({
      branch: selectedBranchId || null,
      date: selectedDate || null,
      endDate: selectedEndDate || null,
      paymentMethod: selectedPaymentMethod !== "All" ? selectedPaymentMethod : null,
    });
  };
  const handleExport = () => {
    onExport?.({
      branch: selectedBranchId || null,
      date: selectedDate || null,
      endDate: selectedEndDate || null,
      paymentMethod: selectedPaymentMethod !== "All" ? selectedPaymentMethod : null,
    });
  };
  const handleReset = () => {
    setSelectedBranchId(null);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedEndDate(new Date().toISOString().split("T")[0]);
    setSelectedPaymentMethod("All");
    onSubmit?.({
      branch: null,
      date: null,
      endDate: null,
      paymentMethod: null,
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
              id="start-date"
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
          {/* Payment Method */}
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Payment Method
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={selectedPaymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            >
              <option value="All">All</option>
              <option value="STORE_CASH">Store Cash</option>
              <option value="STORE_CARD">Store Card</option>
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
