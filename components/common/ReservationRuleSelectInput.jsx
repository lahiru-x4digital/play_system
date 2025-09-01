// play_system/components/ui/reservation-rule-select.jsx
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { bookingService } from "@/services/booking.service";

const ReservationRuleSelectInput = ({
  value,
  onChange,
  error,
  label = "Reservation Rule",
  branch_id,
}) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (branch_id) {
      bookingService
        .getReservationRules(branch_id)
        .then((res) => {
          setRules(res.data || []);
        })
        .catch(() => setRules([]))
        .finally(() => setLoading(false));
    }
  }, [branch_id]);

  return (
    <div style={{ width: "100%", minWidth: "300px" }}>
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(Number(val))}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select reservation rule" />
        </SelectTrigger>
        <SelectContent>
          {rules.map((rule) => (
            <SelectItem key={rule.id} value={rule.id}>
              {rule.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ReservationRuleSelectInput;
