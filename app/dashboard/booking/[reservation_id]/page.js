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
import TimerCountDown from "@/components/common/TimerCountDown";
import { formatHourMin } from "@/lib/combineHourMinute";
import { getOverstayDuration } from "@/utils/calculate-over-time";

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
      <div className="flex flex-wrap gap-6 items-start mb-4">
        {/* Reservation Information */}
        <div className="flex-1 min-w-[260px]">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Reservation Information
          </h3>
          <div className="divide-y divide-muted border border-muted rounded-md bg-background p-2 space-y-1">
            <LabelValue
              label="Customer Name"
              value={
                playReservation.customer
                  ? `${playReservation.customer.first_name} ${
                      playReservation.customer.last_name || ""
                    }`
                  : "-"
              }
            />
            <LabelValue
              label="Mobile"
              value={playReservation.customer?.mobile_number}
            />
            <LabelValue
              label="Type"
              value={playReservation.customer?.customer_type}
            />
            <LabelValue
              label="Branch"
              value={playReservation.branch?.branch_name}
            />
            <LabelValue
              label="Branch Code"
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
        {/* Payment Details */}
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Payment Details
          </h3>
          <div className="divide-y divide-muted border border-muted rounded-md bg-background p-2 space-y-1">
            <LabelValue
              label="Reservation Status"
              value={playReservation.status}
            />
            <LabelValue
              label="Total Price"
              value={playReservation.total_price}
            />

            <LabelValue
              label="Paid Amount"
              value={playReservation.total_payment}
            />
            <LabelValue
              label="Due Amount"
              value={
                playReservation.total_price - playReservation.total_payment
              }
            />
            <LabelValue
              label="Payment Status"
              value={playReservation.payment_status}
            />
          </div>
        </div>
      </div>

      {playReservation.play_reservation_barcodes?.length > 0 && (
        <section className="space-y-6">
          {playReservation.play_reservation_barcodes.map((barcode, idx) => {
            // Ensure both arrays align in rows
            const maxRows = Math.max(
              barcode.playReservationBarCodeExtraTimes?.length || 0,
              barcode.WentOutsideTracker?.length || 0
            );

            return (
              <div
                key={barcode.id || idx}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div>
                  <h3 className="mb-2">Name: {barcode.name}</h3>
                  <p className="text-sm font-semibold">
                    Starting Package :{" "}
                    {`${formatHourMin(
                      barcode.start_hour,
                      barcode.start_min
                    )} - ${formatHourMin(
                      barcode.end_hour,
                      barcode.end_min
                    )}`}{" "}
                    / Price: {barcode.price}
                  </p>
                </div>
                {/* Header Line */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-gray-900">
                      {barcode.name}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                      {barcode.barcode.barcode_number}
                    </span>
                    <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                      {barcode.reservation_rule_id ? "KID" : "ADULT"}
                    </span>
                    {barcode.reservation_rule_id && (
                      <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        <TimerCountDown
                          status={playReservation.status}
                          start_hour={barcode.start_hour}
                          start_min={barcode.start_min}
                          end_hour={barcode.end_hour}
                          end_min={barcode.end_min}
                          extra_minutes={
                            barcode.playReservationBarCodeExtraTimes
                              ? barcode.playReservationBarCodeExtraTimes.reduce(
                                  (sum, et) => sum + (et.extra_minutes || 0),
                                  0
                                )
                              : 0
                          }
                        />
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-red-600 font-semibold">
                    {getOverstayDuration(barcode) > 0 &&
                      `Over Time : ${getOverstayDuration(barcode)} (min)`}
                  </div>
                  <div className="flex items-center gap-2">
                    {barcode.status !== "ACTIVE" && (
                      <Badge
                        variant={
                          barcode.status === "COMPLETED" ? "success" : "default"
                        }
                        className="uppercase"
                      >
                        {barcode.status}
                      </Badge>
                    )}
                    {/* {barcode.status !== "COMPLETED" && (
                      <Button
                        // onClick={() =>
                        //   handleSingleBarcodeUpdate(playReservation.id, barcode.id)
                        // }
                        // disabled={patchHandlerloading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Complete
                      </Button>
                    )} */}
                    <Button
                      className="px-3 py-1 font-semibold"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(barcode)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Extra Time
                    </Button>
                  </div>
                </div>

                {/* Unified Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border">Extra Time</th>
                        <th className="px-3 py-2 border">Extra Duration</th>
                        <th className="px-3 py-2 border">Went Outside</th>
                        <th className="px-3 py-2 border">
                          Went Outside Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: maxRows }).map((_, rowIdx) => {
                        const extraTime =
                          barcode.playReservationBarCodeExtraTimes?.[rowIdx];
                        const outside = barcode.WentOutsideTracker?.[rowIdx];

                        return (
                          <tr key={rowIdx}>
                            {/* Only show Name/Barcode in first row */}

                            {/* Extra Time */}
                            <td className="px-3 py-2 border">
                              {extraTime
                                ? `${formatHourMin(
                                    extraTime.start_hour,
                                    extraTime.start_min
                                  )} - ${formatHourMin(
                                    extraTime.end_hour,
                                    extraTime.end_min
                                  )}`
                                : "-"}
                            </td>
                            <td className="px-3 py-2 border">
                              {extraTime
                                ? `min - ${extraTime.extra_minutes}  / Price - ${extraTime.extra_minute_price}`
                                : "-"}
                            </td>

                            {/* Went Outside */}
                            <td className="px-3 py-2 border">
                              {outside
                                ? `${
                                    outside.out_hour
                                      ? formatHourMin(
                                          outside.out_hour,
                                          outside.out_min
                                        )
                                      : "Out N/A"
                                  } - ${
                                    outside.in_hour
                                      ? formatHourMin(
                                          outside.in_hour,
                                          outside.in_min
                                        )
                                      : "In N/A"
                                  }`
                                : "-"}
                            </td>
                            <td className="px-3 py-2 border">
                              {outside?.out_hour && outside?.in_hour
                                ? `${
                                    outside.in_hour * 60 +
                                    outside.in_min -
                                    (outside.out_hour * 60 + outside.out_min)
                                  } min`
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>
      )}

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
