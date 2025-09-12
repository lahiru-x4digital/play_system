"use client";
import { ScanInput } from "@/components/common/ScanInput";
import useGetPlayReservationsOnCall from "@/hooks/useGetPlayReservationsOnCall";
import { useAxiosPatch } from "@/hooks/useAxiosPatch";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatHourMin } from "@/lib/combineHourMinute";
import { BookingEditDialog } from "@/components/booking/BookingEditDialog";
import { playReservationService } from "@/services/play/playreservation.service";
import toast from "react-hot-toast";
import TimerCountDown from "@/components/common/TimerCountDown";
import { getOverstayDuration } from "@/utils/calculate-over-time";
import PaymentInput from "@/components/common/PaymentInput";
// Utility function to check if input is a number (for barcode or mobile number)
const isMobile = (value) => {
  // Match a mobile number: either exactly 10 digits OR +countryCode with 10–15 digits
  const mobileRegex = /^\+?\d{10,15}$/;

  return mobileRegex.test(value);
};

// Helper function to format date
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Helper function to get status badge variant
const getStatusVariant = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

// Helper function to get payment status variant
const getPaymentVariant = (paymentStatus) => {
  switch (paymentStatus) {
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function page() {
  const [scanValue, setScanValue] = React.useState("");
  const { patchHandler, patchHandlerloading, patchHandlerError } =
    useAxiosPatch();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    playReservations,
    playReservationsLoading,
    playReservationsRefres,
    playReservationsLimit,
    playReservationsError,
    playReservationsTotalCount,
    playReservationsTotalPages,
    playReservationsSearch,
    playReservationsPageNavigation,
    playReservationsChangePageSize,
    playReservationsReset,
    currentPage,
  } = useGetPlayReservationsOnCall();

  // Function to update single barcode status
  const handleSingleBarcodeUpdate = async (bookingID, barcodeId, status) => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();

    const payload = {
      status: status,
      hour: hour,
      min: min,
      reservation_barcode_list: [barcodeId],
    };

    try {
      await playReservationService.updatePlayReservation({
        payload,
        id: bookingID,
      });
      toast.success("Reservation status updated successfully");
      playReservationsReset();
    } catch (error) {
      console.error("Failed to update reservation status:", error);
      toast.error(error.data?.error || "Failed to update reservation status");
    }
  };

  const handleSaveBooking = async (updatedData) => {
    try {
      // Call your API to update the booking here
      // Example: await updateBooking(selectedBooking.id, updatedData);

      // Refresh the table data
      onRefresh?.();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };
  const handleDialogOpenChange = (open) => {
    setEditDialogOpen(open);
    if (!open) {
      setSelectedBooking(null);
      onRefresh?.();
    }
  };
  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };
  const handleUpdateStatus = async (booking, status) => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();

    const payload = {
      status: status,
      hour: null,
      min: null,
    };
    if (status === "WENT_OUTSIDE" || status === "BACK_INSIDE") {
      payload.hour = hour;
      payload.min = min;
    }

    const reservation_barcode_list = booking.play_reservation_barcodes.map(
      (t) => t.id
    );
    payload.reservation_barcode_list = reservation_barcode_list;

    try {
      await playReservationService.updatePlayReservation({
        payload,
        id: booking.id,
      });
      playReservationsReset();
      toast.success("Reservation status updated successfully");
    } catch (error) {
      console.error("Failed to update reservation status:", error);
      toast.error(error.data?.error || "Failed to update reservation status");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Reservation Confirmation
        </h1>
        <p className="text-gray-600">
          Scan barcode or enter mobile number to view confirmed reservations
        </p>
      </div>

      <Card>
        <CardContent className="p-2">
          <ScanInput
            onScan={(data) => {
              // If data is empty or null, reset the search
              if (!data || data.trim() === "") {
                playReservationsReset();
                return;
              }
              // Otherwise, perform the search
              playReservationsSearch({
                pageSize: 10,
                page: 1,
                start_date: null,
                end_date: null,
                mobile_number: isMobile(data) ? data : null,
                reservationStatus: "CONFIRMED,BACK_INSIDE,WENT_OUTSIDE",
                barcode: isMobile(data) ? null : data,
                payment_status: "PAID",
              });
            }}
          />
        </CardContent>
      </Card>

      {playReservationsLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reservations...</p>
          </CardContent>
        </Card>
      )}

      {playReservationsError && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Customer Not Found</p>
              <p className="text-sm mt-1">Please Enter Full Code or Number </p>
            </div>
          </CardContent>
        </Card>
      )}

      {playReservations && playReservations.length > 0 ? (
        <div className="space-y-6">
          {playReservations.map((item, index) => (
            <div key={item.id || index} className="overflow-hidden">
              <div className="flex gap-2 mb-2">
                <Button
                  onClick={() => handleUpdateStatus(item, "COMPLETED")}
                  disabled={patchHandlerloading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {patchHandlerloading ? "Processing..." : "Complete"}
                </Button>
                {/* <Button size="sm" onClick={() => handleEditClick(item)}>
                  Update Status
                </Button> */}
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(item, "WENT_OUTSIDE")}
                  disabled={item.status == "WENT_OUTSIDE"}
                >
                  Went Outside
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(item, "BACK_INSIDE")}
                  disabled={item.status == "BACK_INSIDE"}
                >
                  Back Inside
                </Button>
              </div>
              <div className="bg-gray-50 border-b mb-2">
                <div className="flex items-center justify-between p-3 border-b">
                  {/* Left Section */}
                  <div>
                    <div className="flex items-center ">
                      Reservation #{item.id} /
                      <h2 className="text-lg font-semibold"></h2>
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge variant={getPaymentVariant(item.payment_status)}>
                        {item.payment_status}
                      </Badge>
                      <div className="flex gap-2">
                        / <p>Total Price</p>
                        <p className=" font-bold ">{item.total_price}</p> /
                      </div>
                      <div className="flex gap-2">
                        <p>Total Payment</p>
                        <p className=" font-bold ">{item.total_payment}</p>{" "}
                      </div>
                    </div>
                    <div className="mt-1 text-sm space-y-0.5">
                      <p className="text-gray-700 font-medium">
                        {item.customer?.first_name}{" "}
                        {item.customer?.last_name || ""}
                      </p>
                      <p className="text-gray-500">
                        {item.customer?.mobile_number}
                      </p>
                      <p className="text-gray-500">
                        {item.branch?.branch_name}
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                </div>
              </div>

              {item.play_reservation_barcodes?.length > 0 && (
                <section className="space-y-2">
                  {item.play_reservation_barcodes.map((barcode, idx) => {
                    // Ensure both arrays align in rows
                    const maxRows = Math.max(
                      barcode.play_reservation_barCode_extraTimes?.length || 0,
                      barcode.went_outside_tracker?.length || 0
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
                                  reservation_date={item.reservation_date}
                                  status={barcode.status}
                                  start_hour={barcode.start_hour}
                                  start_min={barcode.start_min}
                                  end_hour={barcode.end_hour}
                                  end_min={barcode.end_min}
                                  extra_minutes={
                                    barcode.play_reservation_barCode_extraTimes
                                      ? barcode.play_reservation_barCode_extraTimes.reduce(
                                          (sum, et) =>
                                            sum + (et.extra_minutes || 0),
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
                              `Over Time : ${getOverstayDuration(
                                barcode
                              )} (min)`}
                          </div>
                          <div className="flex items-center gap-2">
                            {barcode.status !== "ACTIVE" && (
                              <Badge
                                variant={
                                  barcode.status === "COMPLETED"
                                    ? "success"
                                    : "default"
                                }
                                className="uppercase"
                              >
                                {barcode.status}
                              </Badge>
                            )}
                            {/* {barcode.status !== "COMPLETED" && (
                              <Button
                                onClick={() =>
                                  handleSingleBarcodeUpdate(
                                    item.id,
                                    barcode.id,
                                    "COMPLETED"
                                  )
                                }
                                disabled={patchHandlerloading}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Complete
                              </Button>
                            )} */}
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSingleBarcodeUpdate(
                                  item.id,
                                  barcode.id,
                                  "WENT_OUTSIDE"
                                )
                              }
                              disabled={barcode.status == "WENT_OUTSIDE"}
                            >
                              Went Outside
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSingleBarcodeUpdate(
                                  item.id,
                                  barcode.id,
                                  "BACK_INSIDE"
                                )
                              }
                              disabled={barcode.status == "BACK_INSIDE"}
                            >
                              Back Inside
                            </Button>
                          </div>
                        </div>

                        {/* Unified Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 border">Extra Time</th>
                                <th className="px-3 py-2 border">
                                  Extra Duration
                                </th>
                                <th className="px-3 py-2 border">
                                  Went Outside
                                </th>
                                <th className="px-3 py-2 border">
                                  Went Outside Duration
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: maxRows }).map(
                                (_, rowIdx) => {
                                  const extraTime =
                                    barcode
                                      .play_reservation_barCode_extraTimes?.[
                                      rowIdx
                                    ];
                                  const outside =
                                    barcode.went_outside_tracker?.[rowIdx];

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
                                              (outside.out_hour * 60 +
                                                outside.out_min)
                                            } min`
                                          : "-"}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}
            </div>
          ))}
        </div>
      ) : !playReservationsLoading && !playReservationsError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">
              No reservations found
            </p>
            <p className="text-gray-500 mt-1">
              Scan a barcode or enter a mobile number to search for reservations
            </p>
          </CardContent>
        </Card>
      ) : null}
      <BookingEditDialog
        open={editDialogOpen}
        onOpenChange={handleDialogOpenChange}
        bookingData={selectedBooking}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
