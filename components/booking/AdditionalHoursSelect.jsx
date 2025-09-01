import useGetExtraHours from "@/hooks/useGetExtraHours";
import React, { useEffect } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useFormContext } from "react-hook-form";

export default function AdditionalHoursSelect({
  name,
  branchId,
  reservation_rule_id,
}) {
  const { setValue, watch } = useFormContext();
  const { extraHoursList, extraHoursListRefresh, extraHoursListLoading } =
    useGetExtraHours();
  const selectedValue = watch(`${name}.additional_minutes_price_id`);

  useEffect(() => {
    extraHoursListRefresh({
      branch_id: branchId,
      play_reservation_rule_id: reservation_rule_id,
    });
  }, [branchId, reservation_rule_id]);

  const handleValueChange = (val) => {
    const selectedItem = extraHoursList.find((item) => String(item.id) === val);
    if (selectedItem) {
      setValue(`${name}.additional_minutes`, selectedItem.duration);
      setValue(`${name}.additional_minutes_price`, selectedItem.price);
      setValue(`${name}.additional_minutes_price_id`, selectedItem.id);
      setValue(`${name}.minutes_qty`, 1);
    }
  };

  return (
    <div style={{}}>
      <Label className="text-sm font-medium text-gray-900">
        Additional Minutes
      </Label>
      <Select
        value={selectedValue ? String(selectedValue) : ""}
        onValueChange={handleValueChange}
        disabled={extraHoursListLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Additional Minutes" />
        </SelectTrigger>
        <SelectContent>
          {extraHoursList.map((extraHour) => (
            <SelectItem key={extraHour.id} value={String(extraHour.id)}>
              {`min ${extraHour.duration} - price ${extraHour.price}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
