
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

export function AutoBookingDialog() {
    const [mode, setMode] = useState("create")
    const [reservation_id, setReservation_id] = useState(null)

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Create Booking</Button>
        </DialogTrigger>
        <DialogContent 
        onInteractOutside={e => e.preventDefault()}
        className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
            <DialogDescription>
              Create a new reservation for a customer.
            </DialogDescription>
          </DialogHeader>
        
        
          <div>
          <AutoGenarateReservationForm onSuccess={(res)=>{
            console.log("RES",res)
            window.open(`/dashboard/booking/${res?.data?.playReservation?.id}`, '_blank');
          }}/>
          </div>    
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
         
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
