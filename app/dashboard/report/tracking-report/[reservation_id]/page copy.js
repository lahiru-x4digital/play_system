"use client";
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import React, { useEffect, useState } from "react";
import { use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AddBarcodeDialog } from "@/components/booking/AddBarcodeDialog";
import { AddExtraTimeDialog } from "@/components/booking/AddExtraTimeDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getEndTime } from "@/lib/getEndTime";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString();
}

function LabelValue({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value || "-"}</span>
    </div>
  );
}

export default function Page({ params }) {
  const { reservation_id } = use(params);
  const { playReservation, playReservationLoading, playReservationRefresh } =
    useGetSinglePlayReservation();

  // State for managing the dialog

  const [selectedBarcode, setSelectedBarcode] = useState(null);

  const handleOpenDialog = (barcode) => {
    setSelectedBarcode({
      id: barcode.id,
      barcodeNumber: barcode.barcode?.barcode_number,
      customerTypeId: barcode.barcode?.play_customer_type_id,
      branchId: barcode.barcode?.branch_id,
    });
  };

  const handleDialogSuccess = (res) => {
    playReservationRefresh(reservation_id);
    setSelectedBarcode(null);
  };

  useEffect(() => {
    if (reservation_id) {
      playReservationRefresh(reservation_id);
    }
  }, [reservation_id]);

  if (playReservationLoading)
    return (
      <div className="flex justify-center items-center h-64 text-lg">
        Loading...
      </div>
    );

  if (!playReservation)
    return (
      <div className="flex justify-center items-center h-64 text-lg">
        No reservation found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Reservation Summary */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-semibold">
            Reservation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playReservation.customer && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Customer Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LabelValue
                  label="Name"
                  value={`${playReservation.customer.first_name} ${
                    playReservation.customer.last_name || ""
                  }`}
                />
                <LabelValue
                  label="Mobile"
                  value={playReservation.customer.mobile_number}
                />
                <LabelValue
                  label="Level"
                  value={playReservation.customer.customer_level}
                />
              </div>
            </div>
          )}
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Branch Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <LabelValue
                label="Branch"
                value={playReservation.branch?.branch_name}
              />
              <LabelValue
                label="Code"
                value={playReservation.branch?.branch_code || "-"}
              />
              <LabelValue
                label="Created"
                value={formatDate(playReservation.created_date)}
              />
              <LabelValue
                label="Updated"
                value={formatDate(playReservation.updated_date)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Payments */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-semibold">
            Pricing & Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playReservation.play_pricing && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm">
              <LabelValue
                label="Duration"
                value={`${playReservation.play_pricing.duration} min`}
              />
              <LabelValue
                label="Price"
                value={playReservation.play_pricing.price}
              />
              <Badge
                variant={
                  playReservation.play_pricing.is_active
                    ? "default"
                    : "destructive"
                }
              >
                {playReservation.play_pricing.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
            <LabelValue
              label="Total Price"
              value={playReservation.total_price}
            />
            <LabelValue
              label="Total Payment"
              value={playReservation.total_payment}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Payments
            </h3>
            {playReservation.playPayment?.length > 0 ? (
              <ul className="grid gap-2">
                {playReservation.playPayment.map((p) => (
                  <li
                    key={p.id}
                    className="border rounded-md p-2 space-y-1 bg-muted/20"
                  >
                    <LabelValue label="Amount" value={p.amount} />
                    <LabelValue label="Method" value={p.payment_method} />
                    <LabelValue label="Date" value={formatDate(p.createdAt)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground text-sm">
                No payments found.
              </div>
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {playReservation.play_reservation_barcodes.map((b) => (
                <li
                  key={b.id}
                  className="border rounded-xl p-4 space-y-3 bg-muted/10 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-muted-foreground truncate">
                      Name: {b.name}
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {b.barcode?.barcode_number}
                    </Badge>
                  </div>
                  <div className="font-medium text-muted-foreground truncate">
                    Birth Day: {new Date(b?.birth_date).toDateString() || "_"}
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-muted-foreground">
                    {/* <LabelValue
                      label="Customer Type"
                      value={b.barcode?.play_customer_type?.name || "-"}
                    /> */}
                    <LabelValue
                      label="Start Time"
                      value={`${new Date(b.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                    />
                    <LabelValue
                      label="End Time"
                      value={`${getEndTime(
                        b.createdAt,
                        b.initial_minutes,
                        b.extra_minutes || 0
                      )}`}
                    />
                    <LabelValue
                      label="Duration"
                      value={`${b.barcode?.time_duration || "-"} min`}
                    />
                    {/* <LabelValue
                      label="Extra Time"
                      value={`${b.extra_minutes || "-"} min`}
                    /> */}
                    {/* <LabelValue
                      label="Extra Time Price"
                      value={
                        b.extra_minute_price
                          ? `Rs. ${b.extra_minute_price}`
                          : "-"
                      }
                    /> */}
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button
                      className="px-3"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(b)}
                    >
                      <PlusCircle className="mr-1 h-4 w-4" />
                      Add Extra Time
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">
              No barcodes found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Extra Time Dialog */}
      {/* {selectedBarcode && (
        <AddExtraTimeDialog
          open={selectedBarcode ? true : false}
          onOpenChange={() => setSelectedBarcode(null)}
          barcodeId={selectedBarcode.id}
          barcodeNumber={selectedBarcode.barcodeNumber}
          customerTypeId={selectedBarcode.customerTypeId}
          branchId={selectedBarcode.branchId}
          onSuccess={handleDialogSuccess}
        />
      )} */}

      {/* Products */}
      {/* <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-semibold">Products</CardTitle>
        </CardHeader>
        <CardContent>
          {playReservation.play_reservation_products?.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {playReservation.play_reservation_products.map((b) => (
                <li
                  key={b.id}
                  className="border rounded-md p-3 space-y-1 bg-muted/10"
                >
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <Badge variant="outline">{b.play_product?.name}</Badge>
                  </div>
                  <LabelValue label="Price" value={b.play_product?.price} />
                  <LabelValue label="Quantity" value={b?.quantity || "-"} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">
              No products found.
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
