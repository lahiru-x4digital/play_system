
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
import AddScanForm from "./AddScanForm"
import { ScanBarcode } from "lucide-react"

export function ScanReservationDialog({ reservation_id, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Scan Reservation</Button>
      </DialogTrigger> */}
      <DialogContent
        onInteractOutside={e => e.preventDefault()}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Scan Reservation</DialogTitle>
          <DialogDescription>
            Scan barcodes for an existing reservation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center relative">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shadow-lg scale-110">
              <ScanBarcode className="w-4 h-4" />
            </div>
            <span className="ml-2 text-sm font-semibold text-primary">
              Scan
            </span>
          </div>
        </div>
        <AddScanForm reservation_id={reservation_id} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
