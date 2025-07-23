
"use client"
import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
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

export default function AutoGenarateReservationForm(
  {
    onSuccess
  }
) {
    const {timeDurationPricing = [], timeDurationPricingLoading , timeDurationPricingRefres} = useGetTimeDurationPricing();
    const {postHandler,postHandlerloading}=useAxiosPost()
    const isAdmin = useIsAdmin();
    const user =useSessionUser()
    const [open, setOpen] = useState(false);
    const methods = useForm({
      defaultValues: {
        mobile_number: "",
        adults: 1,
        kids: 0,
        adults_time_pricing_id: "",
        kids_time_pricing_id: "",
        first_name: "",
        last_name: "",
        branch_id: user?.branchId,
      },
    });
  
    useEffect(() => {
      if(open){
        if(!isAdmin){
          timeDurationPricingRefres({
            branch_id:user?.branchId,
          });
         
        }
      }
    }, [open]);
  useEffect(() => {
    if(isAdmin && methods.watch("branch_id")){
      timeDurationPricingRefres({
        branch_id:methods.watch("branch_id"),
      });
      
    }
  }, [methods.watch("branch_id")]);
  
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
  
    const onSubmit = async (data) => {
      const payload={
        first_name:data.first_name,
        last_name:data.last_name,
        mobile_number:data.mobile_number,
        branch_id: isAdmin ? data.branch_id : user?.branchId,
        total_price: price,
        play_pricing_id:kids_time_pricing_id,
        customer_types: [
          {
            playCustomerTypeId: ADULTS_ID,
            count: data.adults,
          },
          {
            playCustomerTypeId: KIDS_ID,
            count: data.kids,
          },
        ],
      }
  
   try {
    const res= await postHandler(`auto-booking`,payload)
    if (onSuccess) onSuccess(res);
   } catch (error) {
    
   }
  
      // handle create order logic here
      setOpen(false);
      methods.reset();
    };
  
  return (
    <div>
        <FormProvider {...methods}>
             <form
               onSubmit={methods.handleSubmit(onSubmit)}
               className="space-y-4"
             >
               {/* Mobile Number */}
               <Controller
                 name="branch_id"
                 control={methods.control}
                 rules={{ required: "Branch is required" }}
                 render={({ field, fieldState }) => (
                   <SelectBranch
                     value={field.value}
                     onChange={(e)=>{
                       field.onChange(e)
                       methods.setValue("adults_time_pricing_id","")
                       methods.setValue("kids_time_pricing_id","")
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
               <div>
                 <div className="font-semibold mb-1">Count</div>
                 <div className="flex gap-4">
                   <FormItem className="flex-1">
                     <FormLabel>Adults</FormLabel>
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
                     <FormLabel>Kids</FormLabel>
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
                 </div>
               </div>
               <div>
             
               </div>
               {/* Kids: Count & Time Pricing */}
               <div>
             
                 <FormItem className="flex-1">
                     <FormLabel>Time & Price</FormLabel>
                     <FormControl>
                       <select
                         {...methods.register("kids_time_pricing_id", { required: true ,valueAsNumber: true})}
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
               {/* Calculated Price */}
               <div>
                 <span className="font-semibold">Calculated Price: </span>
                 <span>{price} </span>
               </div>
               <div className="flex gap-2 mt-4">
                 <Button className={'w-full'} type="submit">Create</Button>
                 {/* <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                   Cancel
                 </Button> */}
               </div>
             </form>
           </FormProvider>
    </div>
  )
}
