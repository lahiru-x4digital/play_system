
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
import BarcodePrintView from "./BarcodePrintView"
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation"
import { useEffect } from "react"

export function PrintDialog({
    reservation_id,open,onOpenChange
}) {
    const {playReservation,playReservationLoading,playReservationRefresh} = useGetSinglePlayReservation()

 useEffect(()=>{
     if(reservation_id){
         playReservationRefresh(reservation_id)
     }
 },[reservation_id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto ">
         <BarcodePrintView reservation={playReservation}/>
        </DialogContent>
    </Dialog>
  )
}
