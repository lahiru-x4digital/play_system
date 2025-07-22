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
import { Input } from "@/components/ui/input";
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import { ADULTS_ID, KIDS_ID } from "@/utils/static-variables";
import { useSession } from "next-auth/react";

export default function Orders() {
  const { data: session, status } = useSession();
  
  
  const [open, setOpen] = useState(false);
  const { timeDurationPricing = [], timeDurationPricingLoading } = useGetTimeDurationPricing();
  const methods = useForm({
    defaultValues: {
      mobile_number: "",
      adults: 1,
      kids: 0,
      adults_time_pricing_id: "",
      kids_time_pricing_id: "",
      first_name: "",
      last_name: "",
    },
  });

  // Simple price calculation: $10/adult, $5/kid, $20/hour
  const watch = methods.watch;
  const adults = watch("adults") || 0;
  const kids = watch("kids") || 0;
  const adults_time_pricing_id = watch("adults_time_pricing_id");
  const kids_time_pricing_id = watch("kids_time_pricing_id");

  // Find selected pricing objects
  const adultsPricing = timeDurationPricing.find(
    (p) => p.id === Number(adults_time_pricing_id)
  );
  const kidsPricing = timeDurationPricing.find(
    (p) => p.id === Number(kids_time_pricing_id)
  );

  // Calculate price
  const price =
    (adults * (adultsPricing?.price || 0)) +
    (kids * (kidsPricing?.price || 0));

  const onSubmit = (data) => {
    const payload={
      ...data,
      branch_id: session?.user?.branchId,
    }

    // handle create order logic here
    setOpen(false);
    methods.reset();
    alert("Order created:\n" + JSON.stringify({ payload }, null, 2));
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
                {/* Mobile Number */}
                <PhoneNumberField
                  control={methods.control}
                  name="mobile_number"
                  defaultCountry="ae"
                  preferred={["ae", "sa", "lk", "us", "gb"]}
                />

                {/* First Name & Last Name */}
                <div className="flex gap-4">
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...methods.register("first_name")}
                        placeholder="Enter your name"
                        className="border rounded px-2 py-1 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...methods.register("last_name")}
                        placeholder="Enter your last name"
                        className="border rounded px-2 py-1 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>

                {/* Adults: Count & Time Pricing */}
                <div>
                  <div className="font-semibold mb-1">Adults</div>
                  <div className="flex gap-4">
                    <FormItem className="flex-1">
                      <FormLabel>Count</FormLabel>
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
                    <FormItem className="flex-1">
                      <FormLabel>Time & Price</FormLabel>
                      <FormControl>
                        <select
                          {...methods.register("adults_time_pricing_id", { required: true })}
                          className="border rounded px-2 py-1 w-full"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select duration
                          </option>
                          {timeDurationPricing
                            .filter((p) => p.play_customer_type_id === ADULTS_ID)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.duration} min - {p.price} 
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>

                {/* Kids: Count & Time Pricing */}
                <div>
                  <div className="font-semibold mb-1">Kids</div>
                  <div className="flex gap-4">
                    <FormItem className="flex-1">
                      <FormLabel>Count</FormLabel>
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
                    <FormItem className="flex-1">
                      <FormLabel>Time & Price</FormLabel>
                      <FormControl>
                        <select
                          {...methods.register("kids_time_pricing_id", { required: true })}
                          className="border rounded px-2 py-1 w-full"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select duration
                          </option>
                          {timeDurationPricing
                            .filter((p) => p.play_customer_type_id === KIDS_ID)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.duration} min - {p.price} 
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>

                {/* Calculated Price */}
                <div>
                  <span className="font-semibold">Calculated Price: </span>
                  <span>{price} </span>
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