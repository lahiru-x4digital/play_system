import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { reservationService } from '@/services/reservation.service'
import { format } from 'date-fns'
import ReservationDetails from './reservation-details'
import WaitingListDetails from './waitinglist-details'
import PosEventDetails from './pos-event-details'

export default function CustomerTrackingDialog({ open, tableName, onClose, id,payload }) {


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tableName === 'reservation' ? 'Reservation Details' :tableName === 'waiting_list' ? 'Waiting List Details' : 'Tracking Details'}</DialogTitle>
        </DialogHeader>
        {tableName==='reservation' && (
         <ReservationDetails id={id}/>
        )}
        {tableName==='waiting_list' && (
         <WaitingListDetails id={id}/>
        )}
        {payload && (
         <PosEventDetails payload={payload}/>
        )}
      </DialogContent>
    </Dialog>
  )
}
