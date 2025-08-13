"use client";
import React from "react";
import useGetPlayReservations from "@/hooks/useGetPlayReservations";
import PlayReservationTimeReportTable from "@/components/tracking-report/PlayReservationTimeReportTable";
import { Pagination } from "@/components/ui/pagination";
import ReservationFilter from "@/components/common/ReservationFilter";
import api from "@/services/api";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import * as XLSX from 'xlsx';
export default function page() {
  const {
    playReservations,
    playReservationsLoading,
    playReservationsRefres,
    playReservationsSearch,
    playReservationsLimit,
    playReservationsError,
    playReservationsTotalCount,
    playReservationsTotalPages,
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
      <ReservationFilter
        onSubmit={(data) => {
          const { branch, date, timeDurationId, mobileNumber, ressStatus } =
            data;

          playReservationsSearch({
            search: null,
            branch_id: branch,
            order_id: null,
            time_duration_id: timeDurationId,
            start_date: date,
            end_date: null,
            mobile_number: mobileNumber,
            ress_status: ressStatus,
          });
        }}
         onExport={async(data)=>{
          const { branch, date, timeDurationId } = data;
          const payload={
            search: null,
            branch_id: branch,
            order_id: null,
            time_duration_id: timeDurationId,
            start_date: date,
            skip: 0,
            end_date: null,
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


      />
      <div className="mt-8">
        {playReservationsLoading ? (
          <div className="text-center py-8">Loading reservations...</div>
        ) : (
          <PlayReservationTimeReportTable
          playReservationsLoading={playReservationsLoading}
            data={playReservations}
          />
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={playReservationsTotalPages}
        onPageChange={playReservationsPageNavigation}
        pageSize={playReservationsLimit}
        onPageSizeChange={playReservationsChangePageSize}
        total={playReservationsTotalCount}
      />
    </div>
  );
}
