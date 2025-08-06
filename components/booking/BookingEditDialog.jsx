"use client";
import React from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAxiosPatch } from '@/hooks/useAxiosPatch';
import ExtraHoursSelectInput from '../common/ExtraHoursSelectInput';

export function BookingEditDialog({ open, onOpenChange, bookingData}) {

  const statuses = ["PENDING", "PAID", "REFUND", "CENCELED", "CONFIRMED"];
  const[status, setStatus] = React.useState(bookingData?.status || "");
  const {patchHandler,patchHandlerloading,patchHandlerError}=useAxiosPatch()
 const [extraHours, setExtraHours] = React.useState([]);
  React.useEffect(() => {
    if (bookingData?.status) {
      setStatus(bookingData.status);
    }
  }, [bookingData]);
const handleUpdate = async() => {
  // Filter out null/undefined values and ensure proper structure
  const filteredExtraHours = extraHours
    .filter(item => item && item.extra_hours_id) // Only keep valid items with extra_hours_id
    .map(({ extra_hours_id, extra_pricing, play_customer_type_id, duration, hours_qty }) => ({
      extra_hours_id,
      extra_pricing,
      play_customer_type_id,
      duration,
      hours_qty
    }));
  
  const data = {
    status: status,
    extra_hours: filteredExtraHours,
  };
  
  await patchHandler(`play/auto-booking/${bookingData?.id}`, data);
  onOpenChange(false);
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit ID-{bookingData?.id} / {bookingData?.customer?.first_name||""} {bookingData?.customer?.last_name||""} </DialogTitle>
            <DialogDescription>
              Make changes to your booking here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select 
                name="status" 
                value={status} 
                onValueChange={setStatus}
                >
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
            {
              bookingData?.play_reservation_customer_types?.map((item, index) => {
                const itemTotal = extraHours[index]?.extra_pricing && extraHours[index]?.hours_qty 
                  ? extraHours[index].extra_pricing * extraHours[index].hours_qty 
                  : 0;
                
                return (
                  <div className="grid gap-2 p-2 border" key={item.id}>
                    <h1 className="text-lg font-semibold">{item.playCustomerType.name} /  Pax- {item.count}</h1>
                    <ExtraHoursSelectInput
                      value={extraHours[index]?.extra_hours_id || null}
                      onChange={(val) => setExtraHours(prev => {
                        const newExtraHours = [...prev];
                        newExtraHours[index] = {
                          ...newExtraHours[index],
                          extra_hours_id: val.id,
                          extra_pricing: val.price,
                          play_customer_type_id: item.playCustomerTypeId,
                          duration: val.duration,
                          hours_qty: 1
                        };
                        return newExtraHours;
                      })}
                      label="Extra Hours"
                      branchId={bookingData?.branch_id}
                      customerTypeId={item.playCustomerType.id}
                    /> 
                    <div>
                      <Label className="text-sm font-medium">Hours Qty</Label>
                      <Input
                        type="number"
                        name="extra_hours"
                        value={extraHours[index]?.hours_qty || ""}
                        onChange={(e) => setExtraHours(prev => {
                          const newExtraHours = [...prev];
                          newExtraHours[index] = {
                            ...newExtraHours[index],
                            hours_qty: parseInt(e.target.value) || 1
                          };
                          return newExtraHours;
                        })}
                        placeholder="Enter Hours Qty"
                        min="0"
                      />
                    </div>
                    <div className="font-medium">
                      Total: {itemTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })
            }
            {/* <ExtraHoursSelectInput
              value={bookingData?.extra_hours || ""}
              onChange={(val) => setExtraHours(val)}
              error={extraHoursError}
              label="Extra Hours"
              branchId={bookingData?.branch_id}
              customerTypeId={bookingData?.customer_type_id}
            /> */}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleUpdate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
