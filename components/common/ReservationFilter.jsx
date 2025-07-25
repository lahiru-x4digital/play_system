import React, { useEffect, useState } from "react";
import SelectBranch from "./selectBranch";
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import { useIsAdmin } from "@/lib/getuserData";
import { useSession } from "next-auth/react";
import { KIDS_ID } from "@/utils/static-variables";
import { Button } from "../ui/button";
import { FilterIcon } from "lucide-react";

export default function ReservationFilter({ value, onChange }) {
  const [selectedBranchId, setSelectedBranchId] = useState(
    value?.branch ?? null
  );
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = useIsAdmin();
  const branchId = user?.branchId;
  const { timeDurationPricing, timeDurationPricingRefres } =
    useGetTimeDurationPricing(isAdmin ? null : branchId);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
    onChange?.({ ...value, branch: branchId });
  };
  const handleDateChange = (date) => {
    onChange?.({ ...value, date });
  };
  const handleTimeDurationChange = (timeDurationId) => {
    onChange?.({ ...value, timeDurationId });
  };

  useEffect(() => {
    if (selectedBranchId) {
      timeDurationPricingRefres({ branch_id: selectedBranchId });
    }
  }, [selectedBranchId]);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="">
        {/* Branch */}
        <div className="flex-1 min-w-[200px] flex gap-2">
          <SelectBranch
            value={value?.branch ?? null}
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
              value={value?.date?.toLocaleDateString?.() || ""}
              onChange={(e) =>
                handleDateChange(new Date(e.target.value).toLocaleDateString())
              }
            />
          </div>
          {/* Duration */}
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-semibold text-gray-700">
              Duration
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={value?.timeDurationId || ""}
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
        </div>
        <Button
          size="sm"
          className=" text-white px-4 rounded-md mt-2"
          onClick={() => {
            onChange?.({ ...value, branch: selectedBranchId });
            setSelectedBranchId(null);
          }}
        >
          <FilterIcon className="h-4 w-4" /> Filter
        </Button>
      </div>
    </div>
  );
}
