import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { reservationService } from '@/services/reservation.service'
import { format } from 'date-fns'
import ReservationDetails from './reservation-details'
import WaitingListDetails from './waitinglist-details'
import PosEventDetails from './pos-event-details'
import FeedbackDetails from './feedback-details'
import ClubEventDetails from './club-event-details'
import WalkinListDetails from './walkin-list-details copy'

export default function CustomerTrackingDialog({ open, action_type, onClose, id,payload }) {

console.log(action_type,id)
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{action_type === 'reservation' ? 'Reservation Details' :action_type === 'waiting_list' ? 'Waiting List Details' : 'Tracking Details'}</DialogTitle>
        </DialogHeader>
        {action_type==='reservation' && (
         <ReservationDetails id={id}/>
        )}
        {action_type==='waiting_list' && (
         <WaitingListDetails id={id}/>
        )}
        {action_type==='walkin_list' && (
         <WalkinListDetails id={id}/>
        )}
        {action_type==='feedback' && (
         <FeedbackDetails id={id}/>
        )}
        {action_type==='pos_event' && (
         <PosEventDetails id={id}/>
        )}
        {action_type==='club_event' && (
         <ClubEventDetails id={id}/>
        )}
      </DialogContent>
    </Dialog>
  )
}
