import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import React, { useEffect, useMemo } from "react";
import BarcodePrintView from "../booking/BarcodePrintView";

export default function StepConfirmation({ playReservation }) {
  console.log(playReservation);
  // Pass reservationId to the hook

  const formattedReservation = useMemo(() => {
    if (!playReservation) return null;

    return {
      ...playReservation,
      barcodes:
        playReservation.play_reservation_barcodes?.map((b) => ({
          id: b.barcode.id,
          barcode_number: b.barcode.barcode_number,
          time_duration: b.barcode.time_duration,
          created_date: b.barcode.created_date,
          updated_date: b.barcode.updated_date,
          is_active: b.barcode.is_active,
          branch_id: b.barcode.branch_id,
          play_reservation_id: b.barcode.play_reservation_id,
          extra_minutes: b.extra_minutes || 0,
        })) || [],
      playPayments: playReservation.play_playment || [],
    };
  }, [playReservation]);

  return (
    <div>
      <BarcodePrintView reservation={formattedReservation} />
    </div>
  );
}
