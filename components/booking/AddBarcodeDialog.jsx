import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
import { Button } from '../ui/button'
import {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form";
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { ADULTS_ID, KIDS_ID } from '@/utils/static-variables'
import useGetTimeDurationPricing from '@/hooks/useGetTimeDurationPricing'
import { useAxiosPost } from '@/hooks/useAxiosPost'
import useSessionUser, { useIsAdmin } from '@/lib/getuserData'
import { PhoneNumberField } from '@/components/coustomer-mobile-input'
import SelectBranch from '@/components/common/selectBranch'
import { useParams } from 'next/navigation'
import useGetSinglePlayReservation from '@/hooks/useGetSinglePlayReservation'

export function AddBarcodeDialog() {
  const {reservation_id} = useParams()
    const {timeDurationPricing = [], timeDurationPricingLoading , timeDurationPricingRefres} = useGetTimeDurationPricing();
    const {playReservation,playReservationLoading,playReservationRefresh}=useGetSinglePlayReservation()
    const {postHandler,postHandlerloading}=useAxiosPost()
    const isAdmin = useIsAdmin();
    const user =useSessionUser()
    const [open, setOpen] = useState(false);
    const methods = useForm({
      defaultValues: {
        barcode_number: "",
        time_duration: "",
        play_pricing_id: "",
        reservation_id: reservation_id,
      },
    });
  
    useEffect(()=>{
     if(reservation_id && open){
      playReservationRefresh(reservation_id)
     }
    },[reservation_id,open])


  console.log(playReservation)
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
        cash:data.cash,
        card:data.card,
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
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Add Barcod</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Barcode</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
             <form
               onSubmit={methods.handleSubmit(onSubmit)}
               className="space-y-4"
             >
             
               <div>
                 <div className="font-semibold mb-1">Count</div>
                 <div className="flex gap-4">
                   <FormItem className="flex-1">
                     <FormLabel>Adults</FormLabel>
                     <FormControl>
                       <input
                         type="number"
                         min={0}
                         {...methods.register("adults", { valueAsNumber: true, min: 0 })}
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
               <div className="flex gap-4">
                   <FormItem className="flex-1">
                     <FormLabel>Cash</FormLabel>
                     <FormControl>
                       <input
                         type="number"
                         min={0}
                         {...methods.register("cash", { valueAsNumber: true, min: 0 })}
                         className="border rounded px-2 py-1 w-full"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                   <FormItem className="flex-1">
                     <FormLabel>Card</FormLabel>
                     <FormControl>
                       <input
                         type="number"
                         min={0}
                         {...methods.register("card", { valueAsNumber: true, min: 0 })}
                         className="border rounded px-2 py-1 w-full"
                       />
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
         
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
