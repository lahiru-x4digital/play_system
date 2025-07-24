
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { CirclePlus, ScanBarcode } from "lucide-react"
import AutoGenarateReservationForm from "./AutoGenarateReservationForm";
import BarcodePrintView from "./BarcodePrintView";

export function AutoBookingDialog() {
  const [printBarcodes, setPrintBarcodes] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [open, setOpen] = useState(false); // Track dialog open state

  // Reset all values when dialog closes
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPrintBarcodes(false);
      setReservation(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Create Booking</Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
            <DialogDescription>
              Create a new reservation for a customer.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {printBarcodes ? (
              <BarcodePrintView reservation={reservation}/>
            ) : (
              <AutoGenarateReservationForm onSuccess={(res)=>{
                setPrintBarcodes(true);
                setReservation(res);
              }}/>
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
