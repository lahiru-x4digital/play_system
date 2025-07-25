"use client";
import React from "react";
import useGetPlayReservations from "@/hooks/useGetPlayReservations";
import PlayReservationTimeReportTable from "@/components/tracking-report/PlayReservationTimeReportTable";
import { Pagination } from "@/components/ui/pagination";
import ReservationFilter from "@/components/common/ReservationFilter";
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
      />
      <div className="mt-8">
        {playReservationsLoading ? (
          <div className="text-center py-8">Loading reservations...</div>
        ) : (
          <PlayReservationTimeReportTable
            data={playReservations}
            onRefresh={playReservationsRefres}
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
