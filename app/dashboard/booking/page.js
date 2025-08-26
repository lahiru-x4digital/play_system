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
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import api from "@/services/api";
import * as XLSX from 'xlsx';

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
  const generateExcel = (exportData) => {
    const excelData = exportData.map(item => ({
      'Reservation ID': item.id,
      'Customer': item.customer ? `${item.customer.first_name || ''} ${item.customer.last_name || ''}`.trim() : '-',
      'Mobile': item.customer?.mobile_number || '-',
      'Branch': item.branch?.branch_name || '-',
      'Total Pax': item.play_reservation_customer_types.reduce((sum, item) => sum + item.count, 0) || 0,
      'Total Price': item.total_price || '-',
      'Status': item.status || '-',
      'Payment Status': item.payment_status || '-',
      'Start Time': item?.created_date ? new Date(item?.created_date).toLocaleString() : '-',
      'End Time': item.end_time ? new Date(item.end_time).toLocaleString() : '-',
      'Payment': item?.play_playment?.reduce((sum, item) => sum + item.amount, 0) || 0,
      'Payment Method': item?.play_playment?.[0]?.payment_method || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations');
    XLSX.writeFile(wb, `reservations_${new Date().toISOString().split('T')[0]}.xlsx`);

  };

  return (
    <div>
      <AutoBookingDialog playReservationsRefres={playReservationsRefres} />
      <div className="space-y-4">
        <ReservationFilter
        onExport={async(data)=>{
          const { branch, date, endDate, timeDurationId,ressStatus,reservationStatus } = data;
          const payload={
            search: null,
            branch_id: branch,
            order_id: null,
            time_duration_id: timeDurationId,
            start_date: date,
            skip: 0,
            end_date: endDate,
            ress_status:ressStatus,
            reservationStatus:reservationStatus,
            limit: playReservationsTotalCount,
          }
          try {
            const response = await api.get(`play/play-reservation`, {
              params: {
                ...paramsNullCleaner(payload),
              },
            });
          if(response?.data?.data){
            generateExcel(response?.data?.data);
          }
          } catch (error) {
            
          }
        }}
          onSubmit={(data) => {
            const { branch, date, endDate, timeDurationId,ressStatus,reservationStatus } = data;
            console.log("data",data)
            playReservationsSearch({
              search: null,
              branch_id: branch,
              order_id: null,
              time_duration_id: timeDurationId,
              start_date: date,
              end_date: endDate,
              ress_status:ressStatus,
              reservationStatus:reservationStatus
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
                playReservationsLoading={playReservationsLoading}
             
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
