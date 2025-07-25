import React, { useEffect, useState } from "react";
import SelectBranch from "./selectBranch";
import { Calendar } from "../ui/calendar";
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import { useIsAdmin } from "@/lib/getuserData";
import { useSession } from "next-auth/react";
import { DatePicker } from "./DatePicker";
import { FormControl, FormItem, FormLabel } from "../ui/form";
import { KIDS_ID } from "@/utils/static-variables";

export default function ReservationFilter({ value, onChange, error }) {
  // value: { branch: branchId, date: Date }
  // onChange: (newValue) => void
  const [selectedBranchId, setSelectedBranchId] = useState(
    value?.branch ?? null
  );
  const { data: session } = useSession();

  const user = session?.user;
  const isAdmin = useIsAdmin();
  const branchId = user?.branchId;
  const {
    timeDurationPricing,
    timeDurationPricingLoading,
    timeDurationPricingRefres,
  } = useGetTimeDurationPricing(isAdmin ? null : branchId);
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
    <div style={{ display: "flex", gap: 16 }}>
      <SelectBranch
        value={value?.branch ?? null}
        onChange={handleBranchChange}
        error={error?.branch}
        label="Branch"
      />
      <div>
        <label style={{ display: "block", marginBottom: 4 }}>Date</label>
        <input
          type="date"
          id="end-date"
          className="w-48 border rounded px-2 py-1 font-normal"
          value={value?.date?.toLocaleDateString() || ""}
          onChange={(e) =>
            handleDateChange(new Date(e.target.value).toLocaleDateString())
          }
        />
        {error?.date && (
          <p className="text-red-500 text-xs mt-1">{error.date}</p>
        )}
      </div>
      <div>
        <select
          className="border rounded px-2 py-1 w-full"
          defaultValue=""
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
  );
}
