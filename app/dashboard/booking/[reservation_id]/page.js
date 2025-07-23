'use client'
import React, { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import useGetSinglePlayReservation from '@/hooks/useGetSinglePlayReservation'
import QRCode from 'react-qr-code'

export default function page() {
    const {reservation_id} = useParams()
    const {playReservation,playReservationLoading,playReservationRefresh} = useGetSinglePlayReservation()
    useEffect(()=>{
        if(reservation_id){
             playReservationRefresh(reservation_id)
        }
    },[reservation_id])

    const printRef = useRef(null)
    const handlePrint = () => {
        if (printRef.current) {
            window.print()
        }
    }
    return (
        <div>
            <button onClick={handlePrint} style={{marginBottom: '1rem'}}>Print Barcodes</button>
            <div ref={printRef} className="barcode-print-container">
                {playReservationLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {playReservation?.barcodes?.map((barcode) => (
                            <div
                                key={barcode.id}
                                className="barcode-band"
                                style={{
                                    width: '19mm',
                                    height: '250mm',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #ccc',
                                    marginBottom: '8mm',
                                    pageBreakInside: 'avoid',
                                }}
                            >
                                <QRCode value={barcode.barcode_number} size={60} style={{ marginBottom: '8mm' }} />
                                <div style={{ fontSize: '12pt', wordBreak: 'break-all', textAlign: 'center' }}>{barcode.barcode_number}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .barcode-print-container, .barcode-print-container * {
                        visibility: visible;
                    }
                    .barcode-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        background: white;
                    }
                    .barcode-band {
                        page-break-after: always;
                        break-after: always;
                    }
                    button {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}
