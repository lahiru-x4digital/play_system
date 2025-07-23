import useGetBarCodes from '@/hooks/useGetBarCodes'
import useGetPlayReservations from '@/hooks/useGetPlayReservations'
import useGetSingleBarcode from '@/hooks/useGetSingleBarcode'
import useGetSinglePlayReservation from '@/hooks/useGetSinglePlayReservation'
import React, { useEffect } from 'react'

export default function AddScanForm({reservation_id}) {
    
    const {barcode,barcodeError,barcodeLoading,barcodeRefresh}=useGetSingleBarcode()
    const {playReservation,playReservationLoading,playReservationRefresh}=useGetSinglePlayReservation()
    useEffect(()=>{
        if(reservation_id){
            playReservationRefresh(reservation_id)
        }
    },[reservation_id])
    console.log("playReservation",playReservation)
  return (
    <div>AddScanForm</div>
  )
}
