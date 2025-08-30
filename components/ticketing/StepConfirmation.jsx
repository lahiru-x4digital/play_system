import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import React from "react";

export default function StepConfirmation({ reservationId }) {
  const { playReservation, playReservationLoading, playReservationRefresh } =
    useGetSinglePlayReservation();
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
          play_customer_type: b.barcode.play_customer_type,
          extra_minutes: b.extra_minutes || 0,
        })) || [],
      playPayments: playReservation.play_playment || [],
    };
  }, [playReservation]);
  useEffect(() => {
    if (reservationId) {
      playReservationRefresh(reservationId);
    }
  }, [reservationId]);
  return <div>StepConfirmation</div>;
}
