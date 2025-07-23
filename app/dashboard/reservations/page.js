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
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import { ADULTS_ID, KIDS_ID } from "@/utils/static-variables";
import { useSession } from "next-auth/react";
import SelectBranch from "@/components/common/selectBranch";
import useSessionUser, { useIsAdmin } from "@/lib/getuserData";
import { useAxiosPatch } from "@/hooks/useAxiosPatch";
import { useAxiosPost } from "@/hooks/useAxiosPost";
import useGetPlayReservations from "@/hooks/useGetPlayReservations";
import PlayReservationTable from "@/components/reservation/PlayReservationTable";
import { Pagination } from "@/components/ui/pagination";
import { ReservationDialog } from "@/components/reservation/ReservationDialog";

export default function Orders() {
  const { timeDurationPricing = [], timeDurationPricingLoading , timeDurationPricingRefres} = useGetTimeDurationPricing();
  const {playReservations,playReservationsLoading,playReservationsRefres,playReservationsLimit,playReservationsError,playReservationsTotalCount,playReservationsTotalPages,playReservationsPageNavigation,playReservationsChangePageSize,currentPage}=useGetPlayReservations()
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
      customer_types: [
        {
          playCustomerTypeId: ADULTS_ID,
          count: data.adults,
          playPricingId: adults_time_pricing_id,
        },
        {
          playCustomerTypeId: KIDS_ID,
          count: data.kids,
          playPricingId: kids_time_pricing_id,
        },
      ],
    }

 try {
  const res= await postHandler(`play-reservation`,payload)
 
 } catch (error) {
  
 }

    // handle create order logic here
    setOpen(false);
    methods.reset();
  };

  return (
    <div>
      <ReservationDialog />
      <div className="mt-8">
        {playReservationsLoading ? (
          <div className="text-center py-8">Loading reservations...</div>
        ) : playReservationsError ? (
          <div className="text-center py-8 text-red-500">Failed to load reservations.</div>
        ) : (
          <>
            <PlayReservationTable data={playReservations} onRefresh={playReservationsRefres} />
            <Pagination
              currentPage={currentPage}
              totalPages={playReservationsTotalPages}
              onPageChange={playReservationsPageNavigation}
              pageSize={playReservationsLimit}
              onPageSizeChange={playReservationsChangePageSize}
              total={playReservationsTotalCount}
            />
          </>
        )}
      </div>
    </div>
  );
}