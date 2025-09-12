"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BarcodePrintView from "./BarcodePrintView";
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import { useEffect, useMemo } from "react";

export function PrintDialog({ reservation_id, open, onOpenChange }) {
  const { playReservation, playReservationLoading, playReservationRefresh } =
    useGetSinglePlayReservation();

  useEffect(() => {
    if (reservation_id) {
      playReservationRefresh(reservation_id);
    }
  }, [reservation_id]);

  // Format the data to match the expected structure
  const formattedReservation = useMemo(() => {
    if (!playReservation) return null;

    return {
      ...playReservation,
      barcodes:
        playReservation.play_reservation_barcodes?.map((b) => ({
          id: b.barcode.id,
          barcode_number: b.barcode.barcode_number,
          play_customer_type_id: b.barcode.play_customer_type_id,
          time_duration: b.barcode.time_duration,
          created_date: b.barcode.created_date,
          updated_date: b.barcode.updated_date,
          is_active: b.barcode.is_active,
          branch_id: b.barcode.branch_id,
          play_reservation_id: b.barcode.play_reservation_id,
          play_customer_type: b.barcode.play_customer_type,
          extra_minutes: b.extra_minutes || 0,
        })) || [],
      playPayments: playReservation.playPayment || [],
    };
  }, [playReservation]);

  if (playReservationLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!formattedReservation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle></DialogTitle>

        <DialogContent>
          <div>No reservation data available</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            Print barcodes for the reservation.
          </DialogDescription>
        </DialogHeader>
        <BarcodePrintView reservation={formattedReservation} />
      </DialogContent>
    </Dialog>
  );
}
