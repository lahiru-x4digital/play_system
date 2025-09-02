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
    console.log(barcode);
    setSelectedBarcode({
      id: barcode.id,
      barcodeNumber: barcode.barcode?.barcode_number,
      branchId: barcode.barcode?.branch_id,
      reservation_rule_id: barcode?.reservation_rule_id,
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
    <div className="max-w-5xl mx-auto space-y-2 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto text-sm">
        {/* Reservation Summary Header */}
        <h2 className="text-xl font-bold text-primary mb-4">
          Reservation Summary
        </h2>

        {/* Customer Info */}
        {playReservation.customer && (
          <div className="">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Customer Info
            </h3>
            <div className="divide-y divide-muted border border-muted rounded-md bg-background">
              <div className="flex justify-between px-3 py-2">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">
                  {playReservation.customer.first_name}{" "}
                  {playReservation.customer.last_name || ""}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-medium">
                  {playReservation.customer.mobile_number}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {playReservation.customer.customer_type}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Branch Info */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Branch Info
          </h3>
          <div className="divide-y divide-muted border border-muted rounded-md bg-background">
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">Branch</span>
              <span className="font-medium">
                {playReservation.branch?.branch_name}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">Code</span>
              <span className="font-medium">
                {playReservation.branch?.branch_code || "-"}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {formatDate(playReservation.created_date)}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">
                {formatDate(playReservation.updated_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Barcodes */}
      <div className="overflow-x-auto rounded-lg border border-muted shadow-sm">
        {playReservation.play_reservation_barcodes?.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Customer</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Barcode</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/50">
              {playReservation.play_reservation_barcodes.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  {/* Customer name + birthday */}
                  <td className="px-3 py-2">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(b.birth_date).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2">
                    <Badge
                      variant={b.status === "ACTIVE" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {b.status}
                    </Badge>
                  </td>

                  {/* Time range */}
                  <td className="px-3 py-2 font-medium">
                    {`${String(b.start_hour).padStart(2, "0")}:${String(
                      b.start_min
                    ).padStart(2, "0")} - ${String(b.end_hour).padStart(
                      2,
                      "0"
                    )}:${String(b.end_min).padStart(2, "0")}`}
                  </td>

                  {/* Barcode */}
                  <td className="px-3 py-2 font-mono text-sm">
                    {b.barcode?.barcode_number}
                  </td>

                  {/* Action */}
                  <td className="px-3 py-2 text-right">
                    <Button
                      className="px-3 py-1 font-semibold"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(b)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Extra Time
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-muted-foreground text-sm p-4 text-center">
            No barcodes found.
          </div>
        )}
      </div>

      {/* Add Extra Time Dialog */}
      {selectedBarcode && (
        <AddExtraTimeDialog
          open={selectedBarcode ? true : false}
          onOpenChange={() => setSelectedBarcode(null)}
          barcodeId={selectedBarcode.id}
          barcodeNumber={selectedBarcode.barcodeNumber}
          reservation_rule_id={selectedBarcode.reservation_rule_id}
          branchId={selectedBarcode.branchId}
          onSuccess={handleDialogSuccess}
        />
      )}
      {/* Products */}
      {/* <Card className="shadow-lg rounded-2xl border border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playReservation.play_reservation_products?.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-base">
              {playReservation.play_reservation_products.map((b) => (
                <li
                  key={b.id}
                  className="border rounded-lg p-4 space-y-2 bg-muted/10 hover:bg-muted/20 transition"
                >
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">
                      Product
                    </span>
                    <Badge variant="outline" className="px-2 py-1">
                      {b.play_product?.name}
                    </Badge>
                  </div>
                  <LabelValue label="Price" value={b.play_product?.price} />
                  <LabelValue label="Quantity" value={b?.quantity || "-"} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-base">
              No products found.
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
