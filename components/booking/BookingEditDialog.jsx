"use client";
import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAxiosPatch } from "@/hooks/useAxiosPatch";
import ExtraHoursSelectInput from "../common/ExtraHoursSelectInput";

export function BookingEditDialog({ open, onOpenChange, bookingData }) {
  //log booking data

  // const statuses = ["PENDING", "REFUND", "CENCELED", "CONFIRMED","COMPLETED"];
  const statuses = [
    "COMPLETED",
    "WENT_OUTSIDE",
    "BACK_INSIDE",
    "CONFIRMED",
    "PENDING",
    "CANCELED",
    "REFUNDED",
  ];
  const [status, setStatus] = React.useState(bookingData?.status || "");
  const { patchHandler, patchHandlerloading, patchHandlerError } =
    useAxiosPatch();
  const [extraHours, setExtraHours] = React.useState([]);
  React.useEffect(() => {
    if (bookingData?.status) {
      setStatus(bookingData.status);
    }
  }, [bookingData]);
  const handleUpdate = async () => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();

    const payload = {
      status: status,
      hour: null,
      min: null,
    };
    if (status === "WENT_OUTSIDE") {
      payload.hour = hour;
      payload.min = min;
    }
    if (status === "BACK_INSIDE") {
      payload.hour = hour;
      payload.min = min;
    }
    const reservation_barcode_list = bookingData?.play_reservation_barcodes.map(
      (t) => t.id
    );
    payload.reservation_barcode_list = reservation_barcode_list;

    await patchHandler(`play/play-reservation/${bookingData?.id}`, payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Edit ID-{bookingData?.id} /{" "}
              {bookingData?.customer?.first_name || ""}{" "}
              {bookingData?.customer?.last_name || ""}{" "}
            </DialogTitle>
            <DialogDescription>
              Make changes to your booking here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((statusItem) => (
                    <SelectItem key={statusItem} value={statusItem}>
                      {statusItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleUpdate}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
