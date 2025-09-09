import React, { useEffect } from "react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { myCross } from "@/app/service/my-cross.service";
import { CircleMinus, SquarePlus } from "lucide-react";
import { Button } from "../ui/button";

/**
 * Reusable PaymentInput for react-hook-form payments array
 */
export default function PaymentInput({ branch_id }) {
  const { control, formState, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  const [paymentMethods, setPaymentMethods] = React.useState([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!branch_id) return;
      const res = await myCross.getPaymentMethods(branch_id);
      setPaymentMethods(res || []);
    };
    fetchPaymentMethods();
  }, [branch_id]);

  return (
    <div>
      {fields.map((item, idx) => (
        <div key={item.id} className="flex gap-4 items-end mb-2">
          <FormItem className="flex-1">
            <FormLabel>Payment Method</FormLabel>
            <FormControl>
              <Controller
                name={`payments.${idx}.payment_method`}
                control={control}
                rules={{ required: "Payment method is required", min: 1 }}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value}
                    className="border rounded px-2 py-1 w-full"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <option value="">Select method</option>
                    {paymentMethods?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.method_name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </FormControl>
            <FormMessage>
              {formState.errors?.payments?.[idx]?.payment_method?.message}
            </FormMessage>
          </FormItem>
          <FormItem className="flex-1">
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Controller
                name={`payments.${idx}.amount`}
                control={control}
                rules={{ required: true, min: 0 }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Enter amount"
                    className="w-full text-right"
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        setValue(`payments.${idx}.amount`, "");
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        setValue(`payments.${idx}.amount`, 0);
                      }
                    }}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </FormControl>
            <FormMessage>
              {formState.errors?.payments?.[idx]?.amount?.message}
            </FormMessage>
          </FormItem>
          {/* <button
            type="button"
            className="text-red-500 px-2"
            onClick={() => remove(idx)}
          >
            <CircleMinus />
          </button> */}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="mt-2 px-4 py-1 rounded "
        onClick={() => append({ payment_method: "", amount: 0 })}
      >
        Add Payment <SquarePlus />
      </Button>
    </div>
  );
}
