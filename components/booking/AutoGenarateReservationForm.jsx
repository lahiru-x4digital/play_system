"use client";
import React, { useEffect, useState, useRef } from "react";
import { useForm, FormProvider, Controller, useFieldArray } from "react-hook-form";
import { PhoneNumberField } from "@/components/coustomer-mobile-input";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADULTS_ID, KIDS_ID } from "@/utils/static-variables";
import SelectBranch from "@/components/common/selectBranch";
import useSessionUser, { useIsAdmin } from "@/lib/getuserData";
import { useAxiosPost } from "@/hooks/useAxiosPost";
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import PaymentInput from "../common/PaymentInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetplayCustomerType from "@/hooks/useGetplayCustomerType";
import { Plus } from "lucide-react";

const reservationSchema = z.object({
  mobile_number: z.string().min(1, { message: "Mobile number is required" }),
  adults: z.number().min(1, { message: "Adults is required" }),
  kids: z.number().min(1, { message: "Kids is required" }),
  // adults_time_pricing_id: z.string().min(1, { message: "Adults time pricing is required" }),
  kids_time_pricing_id: z
    .number()
    .min(1, { message: "Kids time pricing is required" }),
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  amount: z.number().min(0, { message: "Amount is required" }),
  first_name: z.string(),
  last_name: z.string(),
  branch_id: z.number().min(1, { message: "Branch is required" }),
});
export default function AutoGenarateReservationForm({ onSuccess }) {
  const {
    timeDurationPricing = [],
    timeDurationPricingLoading,
    timeDurationPricingRefres,
  } = useGetTimeDurationPricing();
  const { postHandler, postHandlerloading } = useAxiosPost();
const {customerTypes,customerTypesLoading,}=useGetplayCustomerType(true)
 const [selectedPricing,setSelectedPricing]=useState(null)
  const isAdmin = useIsAdmin();
  const user = useSessionUser();
  const [open, setOpen] = useState(false);
  const methods = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      mobile_number: "",
      adults: 1,
      kids: 0,
      // adults_time_pricing_id: "",
      kids_time_pricing_id: "",
      first_name: "",
      last_name: "",
      branch_id: user?.branchId,
      payment_method: "CASH",
      amount: 0,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control:methods.control,
    name: "customer_types",
  });
  const selectRef = useRef(null);
  useEffect(() => {
    if (open) {
      if (!isAdmin) {
        timeDurationPricingRefres({
          branch_id: user?.branchId,
        });
      }
    }
  }, [open]);
  useEffect(() => {
    if (isAdmin && methods.watch("branch_id")) {
      timeDurationPricingRefres({
        branch_id: methods.watch("branch_id"),
      });
    }
  }, [methods.watch("branch_id")]);

  // Calculate total price from all customer types
  const totalPrice = methods.watch("customer_types")?.reduce((sum, item) => {
    return sum + (item.price * item.count);
  }, 0) || 0;

  const onSubmit = async (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      mobile_number: data.mobile_number,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
      total_price: totalPrice,
      play_pricing_id: data.kids_time_pricing_id,
      customer_types: data.customer_types?.map(item => ({
        playCustomerTypeId: item.play_customer_type_id,
        count: item.count
      })) || []
    };
    if (data.payment_method === "CASH") {
      payload.cash = totalPrice;
    } else if (data.payment_method === "CARD") {
      payload.card = totalPrice;
    }

    try {
      const res = await postHandler(`auto-booking`, payload);

      if (onSuccess) onSuccess(res?.data);
    } catch (error) {}
    // handle create order logic here
    setOpen(false);
    methods.reset();
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          {/* Mobile Number */}
          <Controller
            name="branch_id"
            control={methods.control}
            rules={{ required: "Branch is required" }}
            render={({ field, fieldState }) => (
              <SelectBranch
                value={field.value}
                onChange={(e) => {
                  field.onChange(e);
                  methods.setValue("adults_time_pricing_id", "");
                  methods.setValue("kids_time_pricing_id", "");
                }}
                error={fieldState.error?.message}
                label="Branch"
              />
            )}
          />
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
        
          {/* Kids: Count & Time Pricing */}
          <div className="flex items-end gap-2">
            <FormItem className="flex-1">
              <FormLabel>Time & Price</FormLabel>
              <FormControl>
              <select
                ref={selectRef}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selectedItem = timeDurationPricing.find(item => item.id === selectedId);
                  setSelectedPricing({
                    play_customer_type_id: selectedItem.play_customer_type_id,
                    play_customer_type_name: selectedItem.play_customer_type.name,
                    duration: selectedItem.duration,
                    price: selectedItem.price,
                    count:0
                  })
                }}
                className="border rounded px-2 py-1 w-full"
                value={selectedPricing?.play_customer_type_id || ""}
              >
                <option value="" disabled className="text-gray-500">
                  Select duration
                </option>
                {timeDurationPricing.map((p) => (
                  <option key={p.id} value={p.id}>
                    <span className="font-semibold">{p.play_customer_type.name}</span> - {p.duration} min - {p.price}
                  </option>
                ))}
              </select>
       
              </FormControl>
              <FormMessage />
            </FormItem>
            <div className="">
              <FormLabel className="mb-2">Count</FormLabel>
            <Input
                className="w-24"
                type="number"
                  value={selectedPricing?.count||""}
                  onChange={(e) => {
                    setSelectedPricing({
                      ...selectedPricing,
                      count: parseInt(e.target.value ||"0")
                    })
                  }}
              />
            </div>
            <Button
                onClick={() => {
              if(selectedPricing?.play_customer_type_id){
                append(selectedPricing)
                setSelectedPricing(null)
                if (selectRef.current) {
                  selectRef.current.value = ""; // Reset select to default value
                }
              }
                }}
                className="ml-2"
              >
                <Plus/>
              </Button>
          </div>
          <div className="mt-4 space-y-3">
            {methods.watch("customer_types")?.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.play_customer_type_name}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>Duration: {item.duration} min</span>
                    <span className="mx-2">•</span>
                    <span>Count: {item.count}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-indigo-600">
                    {item.price * item.count}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.price} per person
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-end justify-between mt-6 p-4 bg-gray-50 rounded-lg">
            <PaymentInput />
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Price</div>
              <div className="text-2xl font-bold text-indigo-600">
                {totalPrice}
              </div>
            </div>
          </div>
          {/* Calculated Price */}

          <div className="flex gap-2 mt-4">
            <Button className={"w-full"} type="submit">
              Create
            </Button>
            {/* <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                   Cancel
                 </Button> */}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
