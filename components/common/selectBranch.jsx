"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useIsAdmin } from "@/lib/getuserData";
import useGetBranches from "@/hooks/useGetBranches";
import { PLAY_BRAND_ID } from "@/utils/static-variables";

const SelectBranch = ({ value, onChange, error, label = "Branch", open }) => {
  const { data: session } = useSession();
  const [countryId, setCountryId] = useState(null);
  const [brandId, setBrandId] = useState(null);
  const user = session?.user;
  const isAdmin = useIsAdmin();
  const branchId = user?.branchId;

  const { branchList, branchListLoading, branchListError, branchFilter } =
    useGetBranches(PLAY_BRAND_ID, isAdmin);

  // const { countryList, countryListLoading } = useGetCountryList();
  // const { brandList, brandListLoading, brandListRefresh } = useGetBrandList();
  // If not admin, auto-select user's branchId on mount
  useEffect(() => {
    if (!isAdmin && branchId && onChange) {
      onChange(branchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, branchId]);

  useEffect(() => {
    if (countryId) {
      brandListRefresh(countryId);
    }
  }, [countryId]);

  useEffect(() => {
    if (brandId) {
      branchFilter({ brand_id: brandId });
    }
  }, [brandId]);

  if (!isAdmin) {
    // No UI, just auto-select branchId
    return null;
  }
  // console.log(branchList)
  return (
    <>
      {/* <div>
        <Label>Country </Label>
        <Select
          value={
            countryId !== undefined && countryId !== null
              ? String(countryId)
              : undefined
          }
          onValueChange={(val) => setCountryId(Number(val))}
          disabled={countryListLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countryList.map((country) => (
              <SelectItem key={country.id} value={String(country.id)}>
                {country.country_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <div style={{ width: "100%", minWidth: "300px" }}>
        <Label>Brand </Label>
        <Select
          value={
            brandId !== undefined && brandId !== null
              ? String(brandId)
              : undefined
          }
          onValueChange={(val) => setBrandId(Number(val))}
          disabled={brandListLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {brandList.map((brand) => (
              <SelectItem key={brand.id} value={String(brand.id)}>
                {brand.brand_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div> */}
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <Label>{label}</Label>
        <Select
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(val) => onChange(Number(val))}
          disabled={branchListLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branchList.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.branch_name || branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-red-500 text-xs ">{error}</p>}
      </div>
    </>
  );
};

export default SelectBranch;
