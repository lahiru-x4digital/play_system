'use client'
import useGetSinglePlayReservation from '@/hooks/useGetSinglePlayReservation'
import React, { useEffect } from 'react'
import { use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

function LabelValue({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="">{value || '-'}</span>
    </div>
  )
}

export default function Page({ params }) {
  const { reservation_id } = use(params);
  const { playReservation, playReservationLoading, playReservationRefresh } = useGetSinglePlayReservation();

  useEffect(() => {
    if (reservation_id) {
      playReservationRefresh(reservation_id);
    }
  }, [reservation_id]);

  if (playReservationLoading) return <div className="flex justify-center items-center h-64 text-lg">Loading...</div>;
  if (!playReservation) return <div className="flex justify-center items-center h-64 text-lg">No reservation found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Reservation Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Reservation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          {/* Customer Info */}
          {playReservation.customer && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Customer Info</h3>
              <LabelValue
                label="Name"
                value={`${playReservation.customer.first_name} ${playReservation.customer.last_name || ''}`}
              />
              <LabelValue label="Mobile" value={playReservation.customer.mobile_number} />
            </div>
          )}

          {/* Branch Info & Dates */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Branch Info</h3>
            <LabelValue label="Branch" value={playReservation.branch?.branch_name} />
            <LabelValue label="Code" value={playReservation.branch?.branch_code} />
            <LabelValue label="Created" value={formatDate(playReservation.created_date)} />
            <LabelValue label="Updated" value={formatDate(playReservation.updated_date)} />
          </div>
        </CardContent>
      </Card>

      {/* Pricing + Payments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Pricing & Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          {/* Pricing */}
          {playReservation.play_pricing && (
            <div className="flex flex-wrap items-center gap-4">
              <LabelValue label="Duration" value={`${playReservation.play_pricing.duration} min`} />
              <LabelValue label="Price" value={playReservation.play_pricing.price} />
              <Badge variant={playReservation.play_pricing.is_active ? 'default' : 'destructive'}>
                {playReservation.play_pricing.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          )}

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabelValue label="Total Price" value={playReservation.total_price} />
            <LabelValue label="Total Payment" value={playReservation.total_payment} />
          </div>

          {/* Customer Types */}
          {playReservation.play_reservation_customer_types?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Types</h3>
              <ul className="space-y-2">
                {playReservation.play_reservation_customer_types.map((ct) => (
                  <div key={ct.id} className="flex gap-2">
                    <span className="text-muted-foreground">{ct.playCustomerType?.name}:</span>
                    <span >{ct.count}</span>
                  </div>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Payments */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Payments</h3>
            {playReservation.play_playment?.length > 0 ? (
              <ul className="grid gap-3">
                {playReservation.play_playment.map((p) => (
                  <li key={p.id} className="border rounded-md p-3 space-y-1">
                    <LabelValue label="Amount" value={p.amount} />
                    <LabelValue label="Method" value={p.payment_method} />
                    <LabelValue label="Date" value={formatDate(p.createdAt)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground">No payments found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Barcodes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Barcodes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm md:text-base">
          {playReservation.barcodes?.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playReservation.barcodes.map((b) => (
                <li key={b.id} className="border rounded-md p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Barcode:</span>
                    <Badge variant="outline">{b.barcode_number}</Badge>
                  </div>
                  <LabelValue label="Duration" value={`${b.time_duration} min`} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">No barcodes found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}