"use client";
import React from "react";
import useGetPlayReservations from "@/hooks/useGetPlayReservations";
import PlayReservationTable from "@/components/reservation/PlayReservationTable";
import { Pagination } from "@/components/ui/pagination";
import ReservationFilter from "@/components/common/ReservationFilter";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import api from "@/services/api";
import * as XLSX from "xlsx";
import { playReportingService } from "@/services/play/reporting.service";

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
    const excelData = exportData.map((item) => ({
      "Reservation ID": item.id,
      Customer: item.customer
        ? `${item.customer.first_name || ""} ${
            item.customer.last_name || ""
          }`.trim()
        : "-",
      Mobile: item.customer?.mobile_number || "-",
      Branch: item.branch?.branch_name || "-",
      "Total Pax": item.play_reservation_barcodes?.length || 0,
      "Total Price": item.total_price || "-",
      Status: item.status || "-",
      "Payment Status": item.payment_status || "-",
      "Start Time": item?.created_date
        ? new Date(item?.created_date).toLocaleString()
        : "-",
      "End Time": item.end_time
        ? new Date(item.end_time).toLocaleString()
        : "-",
      Payment:
        item?.playPayment?.reduce((sum, item) => sum + item.amount, 0) || 0,
      "Payment Method": item?.playPayment?.[0]?.payment_method || "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(
      wb,
      `reservations_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };
  // console.log("Play Reservations:", playReservations);

  return (
    <div>
      <div className="space-y-4">
        <ReservationFilter
          onExport={async (data) => {
            const { branch, date, endDate, reservationStatus } = data;
            const payload = {
              search: null,
              branch_id: branch,
              order_id: null,
              start_date: date,
              skip: 0,
              end_date: endDate,
              reservationStatus: reservationStatus,
              limit: playReservationsTotalCount,
            };
            try {
              const response = await playReportingService.fetchReservations({
                params: paramsNullCleaner(payload),
                signal: null,
              });
              if (response?.data) {
                generateExcel(response.data);
              }
            } catch (error) {}
          }}
          onSubmit={(data) => {
            const { branch, date, endDate, ressStatus, reservationStatus } =
              data;
            console.log("data", data);
            playReservationsSearch({
              search: null,
              branch_id: branch,
              order_id: null,
              start_date: date,
              end_date: endDate,
              ress_status: ressStatus,
              reservationStatus: reservationStatus,
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
