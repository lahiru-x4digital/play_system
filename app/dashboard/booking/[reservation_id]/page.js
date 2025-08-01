'use client'
import useGetSinglePlayReservation from '@/hooks/useGetSinglePlayReservation'
import React, { useEffect, useState } from 'react'
import { use } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AddBarcodeDialog } from '@/components/booking/AddBarcodeDialog'
import { AddExtraTimeDialog } from '@/components/booking/AddExtraTimeDialog'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

function LabelValue({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value || '-'}</span>
    </div>
  )
}

export default function Page({ params }) {
  const { reservation_id } = use(params)
  const { playReservation, playReservationLoading, playReservationRefresh } = useGetSinglePlayReservation()
  
  // State for managing the dialog

  const [selectedBarcode, setSelectedBarcode] = useState(null)

  const handleOpenDialog = (barcode) => {
    setSelectedBarcode({
      id: barcode.id,
      barcodeNumber: barcode.barcode?.barcode_number,
      customerTypeId: barcode.barcode?.play_customer_type_id,
      branchId: barcode.barcode?.branch_id
    })
 
  }

  const handleDialogSuccess = (res) => {
    playReservationRefresh(reservation_id)
  }

  useEffect(() => {
    if (reservation_id) {
      playReservationRefresh(reservation_id)
    }
  }, [reservation_id])

  if (playReservationLoading)
    return <div className="flex justify-center items-center h-64 text-lg">Loading...</div>

  if (!playReservation)
    return <div className="flex justify-center items-center h-64 text-lg">No reservation found.</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Reservation Summary */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-semibold">Reservation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playReservation.customer && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Customer Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LabelValue
                  label="Name"
                  value={`${playReservation.customer.first_name} ${playReservation.customer.last_name || ''}`}
                />
                <LabelValue label="Mobile" value={playReservation.customer.mobile_number} />
                <LabelValue label="Level" value={playReservation.customer.customer_level} />
              </div>
            </div>
          )}
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Branch Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <LabelValue label="Branch" value={playReservation.branch?.branch_name} />
              <LabelValue label="Code" value={playReservation.branch?.branch_code || '-'} />
              <LabelValue label="Created" value={formatDate(playReservation.created_date)} />
              <LabelValue label="Updated" value={formatDate(playReservation.updated_date)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Payments */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-semibold">Pricing & Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playReservation.play_pricing && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm">
              <LabelValue label="Duration" value={`${playReservation.play_pricing.duration} min`} />
              <LabelValue label="Price" value={playReservation.play_pricing.price} />
              <Badge variant={playReservation.play_pricing.is_active ? 'default' : 'destructive'}>
                {playReservation.play_pricing.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <LabelValue label="Total Price" value={playReservation.total_price} />
            <LabelValue label="Total Payment" value={playReservation.total_payment} />
          </div>

          {playReservation.play_reservation_customer_types?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Types</h3>
              <ul className="grid gap-1 text-sm">
                {playReservation.play_reservation_customer_types.map((ct) => (
                  <li key={ct.id} className="flex justify-between">
                    <span>{ct.playCustomerType?.name || `Type ID ${ct.playCustomerTypeId}`}</span>
                    <span>{ct.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Payments</h3>
            {playReservation.play_playment?.length > 0 ? (
              <ul className="grid gap-2">
                {playReservation.play_playment.map((p) => (
                  <li key={p.id} className="border rounded-md p-2 space-y-1 bg-muted/20">
                    <LabelValue label="Amount" value={p.amount} />
                    <LabelValue label="Method" value={p.payment_method} />
                    <LabelValue label="Date" value={formatDate(p.createdAt)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground text-sm">No payments found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Barcodes */}
      <Card>
        <CardHeader className="pb-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Barcodes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {playReservation.play_reservation_barcodes?.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {playReservation.play_reservation_barcodes.map((b) => (
                <li key={b.id} className="border rounded-md p-3 space-y-1 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Barcode</span>
                    <Badge variant="outline">{b.barcode?.barcode_number}</Badge>
                  </div>
                  <LabelValue label="Duration" value={`${b.barcode?.time_duration || '-'} min`} />
                  <LabelValue label="Customer Type" value={b.barcode?.play_customer_type?.name || '-'} />
                  <LabelValue label="Extra Time" value={`${b.extra_minutes || '-'} min`} />
                  <LabelValue label="Extra Time Price" value={`${b.extra_minute_price || '-'}`} />
                  <div className="pt-2 flex justify-end">
                  <Button
                    className="px-2"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(b)}
                  >
                    <PlusCircle className="mr-1" size={16} />
                    Add Extra Time
                  </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">No barcodes found.</div>
          )}
        
        </CardContent>
      </Card>

      {/* Add Extra Time Dialog */}
      {selectedBarcode && (
        <AddExtraTimeDialog 
          open={selectedBarcode?true:false}
          onOpenChange={()=>setSelectedBarcode(null)}
          barcodeId={selectedBarcode.id}
          barcodeNumber={selectedBarcode.barcodeNumber}
          customerTypeId={selectedBarcode.customerTypeId}
          branchId={selectedBarcode.branchId}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Products */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-semibold">Products</CardTitle>
        </CardHeader>
        <CardContent>
          {playReservation.play_reservation_products?.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {playReservation.play_reservation_products.map((b) => (
                <li key={b.id} className="border rounded-md p-3 space-y-1 bg-muted/10">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <Badge variant="outline">{b.play_product?.name}</Badge>
                  </div>
                  <LabelValue label="Price" value={b.play_product?.price} />
                  <LabelValue label="Quantity" value={b?.quantity || '-'} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">No products found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
