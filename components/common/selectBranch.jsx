"use client"
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import useGetPlayEnabledBranches from "@/hooks/useGetPlayEnabledBranches";
import { useIsAdmin } from "@/lib/getuserData";

const SelectBranch = ({ value, onChange, error, label = "Branch", open }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = useIsAdmin()
  const branchId = user?.branchId;

  const {
    branchList,
    branchListLoading,
    branchListError,
  } = useGetPlayEnabledBranches();
  console.log(branchList);
  // If not admin, auto-select user's branchId on mount
  useEffect(() => {
    if (!isAdmin && branchId && onChange) {
      onChange(branchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, branchId]);

  if (!isAdmin) {
    // No UI, just auto-select branchId
    return null;
  }

  return (
    <div style={{ width: "100%", minWidth: "300px" }}>
      <Label>{label}</Label>
      <Select
        value={value !== undefined && value !== null ? String(value) : undefined}
        onValueChange={(val) => onChange(Number(val))}
        disabled={branchListLoading}
      >
        <SelectTrigger
        className="w-full"
        >
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {branchList.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.branch_name || branch.name}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectBranch;
