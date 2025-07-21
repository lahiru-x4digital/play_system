"use client"
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { PhoneNumberField } from "@/components/coustomer-mobile-input";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const [open, setOpen] = useState(false);
  const methods = useForm({
    defaultValues: {
      mobile_number: "",
      adults: 1,
      kids: 0,
      duration: 1,
    },
  });

  // Simple price calculation: $10/adult, $5/kid, $20/hour
  const watch = methods.watch;
  const adults = watch("adults") || 0;
  const kids = watch("kids") || 0;
  const duration = watch("duration") || 1;
  const price = adults * 10 + kids * 5 + duration * 20;

  const onSubmit = (data) => {
    // handle create order logic here
    setOpen(false);
    methods.reset();
    alert("Order created:\n" + JSON.stringify({ ...data, price }, null, 2));
  };

  return (
    <div>
      <h1>Orders</h1>
      <Button onClick={() => setOpen(true)}>Create Order</Button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[350px]">
            <h2 className="text-lg font-bold mb-4">Create Order</h2>
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <PhoneNumberField
                  control={methods.control}
                  name="mobile_number"
                  defaultCountry="ae"
                  preferred={["ae", "sa", "lk", "us", "gb"]}
                />

                <FormItem>
                  <FormLabel>Number of Adults</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={1}
                      {...methods.register("adults", { valueAsNumber: true, min: 1 })}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>Number of Kids</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      {...methods.register("kids", { valueAsNumber: true, min: 0 })}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>Duration (hours)</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={1}
                      {...methods.register("duration", { valueAsNumber: true, min: 1 })}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <div>
                  <span className="font-semibold">Calculated Price: </span>
                  <span>{price} AED</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button type="submit">Create</Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  );
}