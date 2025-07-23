
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
import AddReservationForm from "./AddReservationForm"
import AddScanForm from "./AddScanForm"
import { useState } from "react";
import { CirclePlus, ScanBarcode } from "lucide-react"

export function ReservationDialog() {
    const [mode, setMode] = useState("create")
    const [reservation_id, setReservation_id] = useState(null)

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Create Reservation</Button>
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
          {/* Stepper */}
          <div className="flex items-center justify-center mb-6">
            {/* Step 1: Create */}
            <div className="flex items-center relative">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                  ${mode === "create" ? "bg-primary text-white shadow-lg scale-110" : "bg-gray-200 text-gray-400"}
                `}
              >
                <CirclePlus className="w-4 h-4" />
              </div>
              <span
                className={`ml-2 text-sm transition-colors duration-200
                  ${mode === "create" ? "font-semibold text-primary" : "text-gray-400"}
                `}
              >
                Create
              </span>
            </div>
            {/* Connector */}
            <div className="mx-3 flex-1 h-1 bg-gray-200 rounded-full relative" style={{ minWidth: 24, maxWidth: 32 }}>
              <div
                className={`absolute left-0 top-0 h-1 rounded-full transition-all duration-200
                  ${mode === "scan" ? "bg-primary w-full" : "bg-primary w-1/2"}
                `}
                style={{ transition: "width 0.3s" }}
              />
            </div>
            {/* Step 2: Scan */}
            <div className="flex items-center relative">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                  ${mode === "scan" ? "bg-primary text-white shadow-lg scale-110" : "bg-gray-200 text-gray-400"}
                `}
              >
                <ScanBarcode className="w-4 h-4" />
              </div>
              <span
                className={`ml-2 text-sm transition-colors duration-200
                  ${mode === "scan" ? "font-semibold text-primary" : "text-gray-400"}
                `}
              >
                Scan
              </span>
            </div>
          </div>
          <div>
          {mode==="create" && <AddReservationForm onSuccess={(res)=>{
            setMode("scan")
            setReservation_id(res?.data?.playReservation?.id||null)
            console.log("RESS",res)
          }} />}
          {mode==="scan" && <AddScanForm reservation_id={reservation_id} />}
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
