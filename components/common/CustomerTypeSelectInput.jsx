// play_system/components/ui/customer-type-select.jsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import useGetplayCustomerType from "@/hooks/useGetplayCustomerType";

const CustomerTypeSelect = ({ value, onChange, error, label = "Customer Type", open }) => {
  const { customerTypes, customerTypesLoading } = useGetplayCustomerType(open);

  return (
    <div style={{ width: "100%", minWidth: "300px" }}>
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(Number(val))}
        disabled={customerTypesLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select customer type" />
        </SelectTrigger>
        <SelectContent>
          {customerTypes?.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
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

export default CustomerTypeSelect;