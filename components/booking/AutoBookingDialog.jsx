"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { CirclePlus, ScanBarcode } from "lucide-react";
import AutoGenarateReservationForm from "../common/AutoGenarateReservationForm";
import BarcodePrintView from "./BarcodePrintView";
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";

export function AutoBookingDialog({playReservationsRefres}) {
  const [printBarcodes, setPrintBarcodes] = useState(false);
  const [reservation_id, setReservation_id] = useState(null);
  const [open, setOpen] = useState(false); // Track dialog open state

  const { playReservation, playReservationLoading, playReservationRefresh } =
  useGetSinglePlayReservation();

useEffect(() => {
  if (reservation_id) {
    playReservationRefresh(reservation_id);
  }
}, [reservation_id]);
  // Reset all values when dialog closes
  const handleOpenChange = (isOpen) => {
   setOpen(isOpen);
    if (!isOpen) {
      setPrintBarcodes(false);
      setReservation_id(null);
      playReservationsRefres();
    }
  };
    const formattedReservation = useMemo(() => {
      if (!playReservation) return null;
  
      return {
        ...playReservation,
        barcodes: playReservation.play_reservation_barcodes?.map(b => ({
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
        playPayments: playReservation.play_playment || []
      };
    }, [playReservation]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button className="bg-primary text-white mb-2">Create Booking</Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:min-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
            <DialogDescription>
              Create a new reservation for a customer.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto">
            {reservation_id && playReservationLoading && (
              <div>Loading...</div>
            )}
            {printBarcodes ? (
              <BarcodePrintView reservation={formattedReservation} />
            ) : (
              <AutoGenarateReservationForm
                onSuccess={(res) => {
                  setPrintBarcodes(true);
                  setReservation_id(res?.playReservation?.id);
                }}
                open={open}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
