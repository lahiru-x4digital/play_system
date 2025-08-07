// play_system/components/ui/customer-type-select.jsx
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import useGetplayCustomerType from "@/hooks/useGetplayCustomerType";
import useGetExtraHours from "@/hooks/useGetExtraHours";

const ExtraHoursSelectInput = ({ value, onChange, error, label = "Extra Hours", branchId, customerTypeId }) => {
 const {extraHoursList,extraHoursListLoading,extraHoursListRefresh}=useGetExtraHours()
console.log(extraHoursList)
 useEffect(() => {
  if(branchId && customerTypeId){
    extraHoursListRefresh({branch_id:branchId,customerTypeId:customerTypeId})
  }
 }, [branchId,customerTypeId])
  return (
    <div style={{ width: "100%", minWidth: "300px" }}>
      <Label>{label}</Label>
      <Select
        value={value}
       onValueChange={(id) => {
    // Find the selected item from the list and pass it to the parent
    const selectedItem = extraHoursList.find(item => item.id === id);
    onChange(selectedItem);
  }}
        disabled={extraHoursListLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Extra Hours" />
        </SelectTrigger>
        <SelectContent>
          {extraHoursList?.map((type) => (
            <SelectItem key={type.id} value={type.id}>
             min - {type.duration} / price - {type.price}
            </SelectItem>
          ))}
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

export default ExtraHoursSelectInput;