import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "Card", value: "CARD" },
];

/**
 * Reusable PaymentInput for react-hook-form
 */
export default function PaymentInput() {
  const { control, formState } = useFormContext();
  const paymentMethodError = formState.errors?.payment_method?.message;
  const amountError = formState.errors?.amount?.message;

  return (
    <div className="flex gap-4 items-end">
      <FormItem className="flex-1">
        <FormLabel> Payment</FormLabel>
        <FormControl>
          <Controller
            name={"payment_method"}
            control={control}
            defaultValue={PAYMENT_METHODS[0].value}
            render={({ field }) => (
              <select {...field} className="border rounded px-2 py-1 w-full">
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          />
        </FormControl>
      </FormItem>
      {/* <FormItem className="flex-1">
        <FormLabel>Amount</FormLabel>
        <FormControl>
          <Controller
            name={"amount"}
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                min={0}
                step="any"
                placeholder="Enter amount"
                className="w-full"
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    field.onChange("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    field.onChange(0);
                  }
                  field.onBlur();
                }}
              />
            )}
          />
        </FormControl>
      </FormItem> */}
    </div>
  );
}
