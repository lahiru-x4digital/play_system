"use client";
import React, { useState, useEffect } from "react";
import SelectBranch from "./selectBranch";
import { Button } from "../ui/button";
import { FilterIcon } from "lucide-react";
import { myCross } from "@/services/play/my-cross.service";

export default function PaymentFilter({ onSubmit, onExport }) {
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Fetch payment methods when branch changes
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!selectedBranchId) {
        setPaymentMethods([]);
        setSelectedPaymentMethod("All");
        return;
      }

      setLoadingPaymentMethods(true);
      try {
        const res = await myCross.getPaymentMethods(selectedBranchId);
        setPaymentMethods(res || []);
        setSelectedPaymentMethod("All"); // Reset to "All" when branch changes
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        setPaymentMethods([]);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [selectedBranchId]);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
    // Payment methods will be fetched automatically via useEffect
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
      paymentMethod:
        selectedPaymentMethod !== "All" ? selectedPaymentMethod : null,
    });
  };

  const handleExport = () => {
    onExport?.({
      branch: selectedBranchId || null,
      date: selectedDate || null,
      endDate: selectedEndDate || null,
      paymentMethod:
        selectedPaymentMethod !== "All" ? selectedPaymentMethod : null,
    });
  };

  const handleReset = () => {
    setSelectedBranchId(null);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedEndDate(new Date().toISOString().split("T")[0]);
    setSelectedPaymentMethod("All");
    setPaymentMethods([]);
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
              disabled={loadingPaymentMethods || !selectedBranchId}
            >
              <option value="All">All</option>
              {loadingPaymentMethods ? (
                <option disabled>Loading...</option>
              ) : (
                paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.method_name}
                  </option>
                ))
              )}
            </select>
            {!selectedBranchId && (
              <p className="text-sm text-gray-500 mt-1">
                Select a branch to load payment methods
              </p>
            )}
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
