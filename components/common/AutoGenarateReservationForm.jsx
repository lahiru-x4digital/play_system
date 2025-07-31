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
import PaymentInput from "./PaymentInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetplayCustomerType from "@/hooks/useGetplayCustomerType";
import { Delete, Plus, Trash } from "lucide-react";
import AdditionalHoursSelect from "../booking/AdditionalHoursSelect";

const reservationSchema = z.object({
  mobile_number: z.string().min(1, { message: "Mobile number is required" }),
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  amount: z.number().min(0, { message: "Amount is required" }),
  first_name: z.string(),
  last_name: z.string(),
  branch_id: z.number().min(1, { message: "Branch is required" }),
  customer_types: z.array(z.object({
    play_customer_type_id: z.number(),
    pricing_id: z.number(),
    play_customer_type_name: z.string(),
    duration: z.number(),
    price: z.number(),
    count:z.number(),
    additional_hours:z.number(),
    additional_hours_price:z.number(),
    additional_hours_price_id:z.number().optional(),
    hours_qty:z.number()
  })),
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
      first_name: "",
      last_name: "",
      branch_id: user?.branchId,
      payment_method: "CASH",
      amount: 0,
      customer_types: [],
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
//form state error consoel log
  const onSubmit = async (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      mobile_number: data.mobile_number,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
      total_price: totalPrice,
      customer_types: data.customer_types?.map(item => ({
        playCustomerTypeId: item.play_customer_type_id,
        playPricingId: item.pricing_id,
        price: item.price,
        duration:item.duration, 
        count: item.count,
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
                    pricing_id: selectedItem.id,
                    play_customer_type_name: selectedItem.play_customer_type.name,
                    duration: selectedItem.duration,
                    price: selectedItem.price,
                    count:0,

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
                      count: parseInt(e.target.value ||"0"),
                     
                    })
                  }}
              />
            </div>
            <Button
             type="button"
                onClick={() => {
              if(selectedPricing?.play_customer_type_id){
                append({...selectedPricing,additional_hours:0,additional_hours_price_id:null})
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
        <div className="mt-2 space-y-5">
          {methods.watch("customer_types")?.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-white rounded-xl shadow border border-gray-200 hover:shadow-md transition-all"
            >
             <div className="flex">
               {/* Left Block */}
               <div className="flex-1 space-y-2">
                <h4 className="text-lg font-semibold text-gray-800">{item.play_customer_type_name}</h4>
                <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                  <span>Duration: {item.duration} min</span>
                  <span>•</span>
                  <span>Count: {item.count}</span>
                </div>
              </div>

              {/* Right Block */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-3 sm:gap-1 text-right min-w-[120px]">
                <div>
                <span className=" font-semibold"> per person </span>

                  <span className="font-semibold">{item.price * item.count}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span>Extra {methods.watch(`customer_types.${index}.hours_qty`)*methods.watch(`customer_types.${index}.price`)}</span>
                </div>
                <div>
                <span className="font-semibold">Total</span>
                  <span className="text-xl font-semibold"> {item.price * item.count + methods.watch(`customer_types.${index}.hours_qty`)*methods.watch(`customer_types.${index}.price`)}</span>
                </div>
              </div>
             </div>
              <div className="flex gap-2 items-end justify-between">
                  {/* Dropdown */}
                  <Controller
                    name={`customer_types.${index}.additional_hours_price_id`}
                    control={methods.control}
                    render={({ field }) => (
                      <AdditionalHoursSelect
                        value={field.value}
                        onChange={field.onChange}
                        branchId={methods.watch("branch_id")}
                        userType={item.play_customer_type_id}
                      />
                    )}
                  />

                  {/* Quantity input */}
                  <Input
                    type="number"
                    {...methods.register(`customer_types.${index}.hours_qty`)}
                    defaultValue={0}
                    placeholder="Hours quantity"
                    className="border rounded w-20 focus:ring-2 focus:ring-indigo-500"
                  />
                   <button
                className="p-1 border-2 rounded hover:bg-red-500 hover:text-white cursor-pointer "
                  type="button"
                  onClick={() => remove(index)}
                >
                <Trash className="w-4 h-4 "/>
                </button>
                  
                </div>
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
