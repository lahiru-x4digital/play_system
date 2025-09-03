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
import { Plus, Trash } from "lucide-react";
import AdditionalProductSelect from "../booking/AdditionalProductSelect";

const reservationSchema = z.object({
  mobile_number: z.string().min(1, { message: "Mobile number is required" }),
  payment_method: z.enum(["STORE_CASH", "STORE_CARD"], { message: "Please select a valid payment method" }),
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
    count: z.number(),
    additional_minutes: z.number().optional(),
    additional_minutes_price: z.number().optional(),
    additional_minutes_price_id: z.number().nullable(),
    minutes_qty: z.number().optional(),
    customers: z.array(z.object({
      name: z.string().optional(),
      birthday: z.string().optional()
    }))
  })),
  additional_products: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    qty: z.number()
  }))
});
export default function AutoGenarateReservationForm({ onSuccess, open }) {
  const {
    timeDurationPricing = [],
    timeDurationPricingLoading,
    timeDurationPricingRefres,
  } = useGetTimeDurationPricing();
  const { postHandler, postHandlerloading } = useAxiosPost();
  const [selectedPricing, setSelectedPricing] = useState(null)
  const [selectedAdditionalProduct, setSelectedAdditionalProduct] = useState(null)

  const isAdmin = useIsAdmin();
  const user = useSessionUser();
  const methods = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      mobile_number: "",
      first_name: "",
      last_name: "",
      branch_id: user?.branchId,
      payment_method: "STORE_CASH",
      amount: 0,
      customer_types: [],
      additional_products: []
    },
  });
  //log form state error

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "customer_types",
  });
  const { fields: additionalProducts, append: appendAdditionalProduct, remove: removeAdditionalProduct } = useFieldArray({
    control: methods.control,
    name: "additional_products",
  });
  const selectRef = useRef(null);
  console.log(open)
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

  // Calculate total price from all customer types and additional products
  const totalPrice = (methods.watch("customer_types")?.reduce((sum, item) => {
    const basePrice = item.price * item.count;
    const additionalMinutesPrice = (item.additional_minutes_price || 0) * (item.minutes_qty || 0);
    return sum + basePrice + additionalMinutesPrice;
  }, 0) || 0) +
    (methods.watch("additional_products")?.reduce((sum, product) => {
      return sum + (product.price * (product.qty || 0));
    }, 0) || 0);

  //! debug the relations are they working corectly 
  //! check edge cases of calculations 
  //!check customer hooks data fetichng infinite loop api calls 
  console.log(methods.formState.errors)
  console.log(methods.watch("customer_types")[0])
  console.log("Current payment_method:", methods.watch("payment_method"))
  console.log("Form values:", methods.getValues())
  //form state error consoel log
  const onSubmit = async (data) => {
    console.log("Form data payment_method:", data.payment_method);
    console.log("Full form data:", data);
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      mobile_number: data.mobile_number,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
      total_price: totalPrice,
      status: "CONFIRMED",
      payment_status: "PAID",
      payment_method: data.payment_method,
      customer_types: data.customer_types?.map(item => ({
        playCustomerTypeId: item.play_customer_type_id,
        playPricingId: item.pricing_id,
        price: item.price,
        duration: item.duration,
        count: item.count,
        additional_minutes_price_id: item.additional_minutes_price_id,
        additional_minutes_price: item.additional_minutes_price,
        additional_minutes: item.additional_minutes,
        minutes_qty: item.minutes_qty,
        customers: item.customers?.filter?.(customer => customer.name !== "" && customer.name !== undefined && customer.name !== null) || []
      })) || [],
      products: data.additional_products?.map(item => ({
        play_product_id: item.id,
        quantity: item.qty,
      })) || [],
    };
    console.log("payload", payload)
    if (data.payment_method === "STORE_CASH") {
      payload.cash = totalPrice;
    } else if (data.payment_method === "STORE_CARD") {
      payload.card = totalPrice;
    }

    console.log("About to send payload:", payload);
    console.log("Payment method in payload:", payload.payment_method);
    
    try {
      const res = await postHandler(`auto-booking`, payload);

      if (onSuccess) onSuccess(res?.data);
      methods.reset(); // Reset only on success
    } catch (error) { }
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
                      count: 0,
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
                value={selectedPricing?.count || ""}
                onChange={(e) => {
                  setSelectedPricing({
                    ...selectedPricing,
                    count: parseInt(e.target.value || "0"),
                    
                  })
                }}
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                if (selectedPricing?.play_customer_type_id) {
                  append({
                    ...selectedPricing,
                    additional_minutes: 0,
                    additional_minutes_price: 0,
                    additional_minutes_price_id: null,
                    minutes_qty: 0,
                    customers: Array(selectedPricing.count).fill({ name: '', birthday: '' })
                  })
                  setSelectedPricing(null)
                  if (selectRef.current) {
                    selectRef.current.value = ""; // Reset select to default value
                  }
                }
              }}
              className="ml-2"
            >
              <Plus />
            </Button>
          </div>
          <div className="mt-4 space-y-6">
            {methods.watch("customer_types")?.map((item, index) => {
              const minutesQty = Number(methods.watch(`customer_types.${index}.minutes_qty`) || 0)
              const baseTotal = item.price * item.count
              const extra = (methods.watch(`customer_types.${index}.minutes_qty`) || 0) * (methods.watch(`customer_types.${index}.additional_minutes_price`) || 0)
              const total = baseTotal + extra
              return (
                <div
                  key={index}
                  className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    {/* Left */}
                    <div className="space-y-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {item.play_customer_type_name}
                      </h4>
                      <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                        <span>Duration: {item.duration} min</span>
                        <span>•</span>
                        <span>Count: {item.count}</span>
                      </div>
                    </div>

                    {/* Right Summary */}
                    <div className="grid grid-cols-1 text-right gap-4 min-w-[80px]">
                      {/* <div>
                        <div className="text-xs text-gray-500">Base Total</div>
                        <div className="text-md font-medium text-gray-800">{baseTotal.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">{item.price} per person</div>
                      </div> */}
                      {/* <div>
                        <div className="text-xs text-gray-500">Extra</div>
                        <div className="text-md font-medium text-orange-600">{extra} min</div>
                        <div className="text-xs text-gray-400"> x {minutesQty} Qty</div>
                      </div> */}
                      <div>
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-xl font-semibold text-indigo-600">{total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  {methods.watch(`customer_types.${index}.count`) > 0 && (
                    <div className="mt-2 space-y-2">
                      {Array.from({ length: methods.watch(`customer_types.${index}.count`) || 0 }).map((_, customerIndex) => (
                        <div key={customerIndex} className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder={`Customer ${customerIndex + 1} Name`}
                            {...methods.register(`customer_types.${index}.customers.${customerIndex}.name`)}
                            className="border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 flex-1"
                            onMouseWheel={(e) => e.target.blur()}
                          />
                          <Input
                            type="date"
                            {...methods.register(`customer_types.${index}.customers.${customerIndex}.birthday`)}
                            className="border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 w-40"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Controls Row */}
                  <div className="mt-4 flex flex-wrap items-end gap-3 justify-between sm:justify-start">
                    {/* Additional Hours Select */}
                    {/* <AdditionalHoursSelect
                      name={`customer_types.${index}`}
                      branchId={methods.watch("branch_id")}
                      userType={item.play_customer_type_id}
                    /> */}

                    {/* Quantity Input */}
                    {/* <div>
                      <label className="block text-sm text-gray-600 mb-1">Extra Qty</label>
                      <Input
                        type="number"
                        min={0}
                        {...methods.register(`customer_types.${index}.minutes_qty`, {
                          valueAsNumber: true
                        })}
                        defaultValue={0}
                        placeholder="0"
                        className="border rounded w-24 px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                        onMouseWheel={(e) => e.target.blur()}
                      />
                    </div> */}
                   
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-1 px-3 py-2 border text-sm rounded text-red-600 border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 items-end justify-between">
            <AdditionalProductSelect
              value={selectedAdditionalProduct}
              onChange={(value) => {
                setSelectedAdditionalProduct({ ...value, qty: 1 })
              }}
              branchId={methods.watch("branch_id")}
            />
            <Input
              type="number"
              min={0}
              onChange={(e) => {
                setSelectedAdditionalProduct({ ...selectedAdditionalProduct, qty: Number(e.target.value) })
              }}
              value={selectedAdditionalProduct?.qty || ""}
              placeholder="0"
              className="border rounded w-24 px-2 py-1 focus:ring-2 "
              onMouseWheel={(e) => e.target.blur()}
            />
            <Button
              type="button"
              onClick={() => {
                if (selectedAdditionalProduct?.id) {
                  appendAdditionalProduct({ ...selectedAdditionalProduct })
                  setSelectedAdditionalProduct(null)
                
              
                }
              }}
              className="ml-2"
            >
              <Plus />
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {methods.watch("additional_products")?.map((item, index) => {
              const total = item.price * item.qty

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  {/* Product Info */}
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                      <span>Price: {item.price}</span>
                      <span>Qty: {item.qty}</span>
                    </div>
                    {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeAdditionalProduct(index)}
                    className="flex items-center gap-1 px-2 py-1 border rounded text-sm text-red-600 border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                    
                  </button>
                  </div>

                  {/* Total Block */}
                  <div className="text-right">
                    <div className="text-xl font-semibold text-indigo-600">
                      {total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>

                  
                </div>
              )
            })}
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
            <Button disabled={methods.watch('customer_types')?.length === 0 || postHandlerloading} className={"w-full"} type="submit">
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
