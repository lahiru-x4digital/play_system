"use client";
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
import { AutoBookingDialog } from "@/components/booking/AutoBookingDialog";
import ReservationFilter from "@/components/common/ReservationFilter";

export default function Booking() {
  const {
    playReservations,
    playReservationsLoading,
    playReservationsRefres,
    playReservationsLimit,
    playReservationsError,
    playReservationsTotalCount,
    playReservationsTotalPages,
    playReservationsSearch,
    playReservationsPageNavigation,
    playReservationsChangePageSize,
    currentPage,
  } = useGetPlayReservations();

  return (
    <div>
      <AutoBookingDialog playReservationsRefres={playReservationsRefres} />
      <div className="space-y-4">
        <ReservationFilter
          onSubmit={(data) => {
            const { branch, date, timeDurationId } = data;
            playReservationsSearch({
              search: null,
              branch_id: branch,
              order_id: null,
              time_duration_id: timeDurationId,
              start_date: date,
              end_date: null,
            });
          }}
        />
        <div className="rounded-md border">
          {playReservationsLoading ? (
            <div className="text-center py-8">Loading reservations...</div>
          ) : playReservationsError ? (
            <div className="text-center py-8 text-red-500">
              Failed to load reservations.
            </div>
          ) : (
            <>
              <PlayReservationTable
                data={playReservations}
                onRefresh={playReservationsRefres}
                playReservationsLoading={playReservationsLoading}
                playReservationsChangePageSize={playReservationsChangePageSize}
                playReservationsTotalCount={playReservationsTotalCount}
              />
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
    </div>
  );
}
