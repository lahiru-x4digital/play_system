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
  const selectedValue = watch(name);

  useEffect(() => {
    extraHoursListRefresh({
      branch_id: branchId,
      play_reservation_rule_id: reservation_rule_id,
    });
  }, [branchId, reservation_rule_id]);

  const handleValueChange = (val) => {
    const selectedItem = extraHoursList.find((item) => String(item.id) === val);
    console.log({ selectedItem });
    if (selectedItem) {
      setValue(`additional_minutes`, selectedItem.duration);
      setValue(`additional_minutes_price`, selectedItem.price);
      setValue(`play_reservation_id`, selectedItem.play_reservation_rule_id);
      setValue(`additional_minutes_price_id`, selectedItem.id);
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
