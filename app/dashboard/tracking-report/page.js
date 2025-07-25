'use client'
import React from 'react'
import useGetPlayReservations from '@/hooks/useGetPlayReservations'
import PlayReservationTimeReportTable from '@/components/tracking-report/PlayReservationTimeReportTable'
import { Pagination } from '@/components/ui/pagination'
export default function page() {
  const {playReservations,playReservationsLoading,playReservationsRefres,playReservationsLimit,playReservationsError,playReservationsTotalCount,playReservationsTotalPages,playReservationsPageNavigation,playReservationsChangePageSize,currentPage}=useGetPlayReservations()

  return (
    <div>
     <PlayReservationTimeReportTable data={playReservations} onRefresh={playReservationsRefres} />
     <Pagination
       currentPage={currentPage}
       totalPages={playReservationsTotalPages}
       onPageChange={playReservationsPageNavigation}
       pageSize={playReservationsLimit}
       onPageSizeChange={playReservationsChangePageSize}
       total={playReservationsTotalCount}
     />
    </div>
  )
}
