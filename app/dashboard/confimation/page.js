"use client";
import { ScanInput } from "@/components/common/ScanInput";
import useGetPlayReservationsOnCall from "@/hooks/useGetPlayReservationsOnCall";
import { useAxiosPatch } from "@/hooks/useAxiosPatch";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatHourMin } from "@/lib/combineHourMinute";
import { BookingEditDialog } from "@/components/booking/BookingEditDialog";
import { Pencil } from "lucide-react";

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
  const handleSingleBarcodeUpdate = async (barcodeId) => {
    try {
      const response = await patchHandler(
        "play/play-reservation/confirmation",
        {
          barcodeIds: [barcodeId],
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Barcode marked as completed`,
          variant: "default",
        });
        // Refresh the data to show updated status
        playReservationsRefres();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update barcode status",
        variant: "destructive",
      });
    }
  };

  // Function to mark all barcodes for a reservation as complete
  const handleMarkAllComplete = async (reservationId) => {
    try {
      const response = await patchHandler(
        "play/play-reservation/confirmation",
        {
          reservationId: reservationId,
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `All barcodes marked as completed`,
          variant: "default",
        });
        // Refresh the data to show updated status
        playReservationsRefres();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update barcodes",
        variant: "destructive",
      });
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
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm mt-1">Please try again</p>
            </div>
          </CardContent>
        </Card>
      )}

      {playReservations && playReservations.length > 0 ? (
        <div className="space-y-6">
          {playReservations.map((item, index) => (
            <div key={item.id || index} className="overflow-hidden">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleMarkAllComplete(item.id)}
                  disabled={patchHandlerloading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {patchHandlerloading ? "Processing..." : "Complete All"}
                </Button>
                <Button size="sm" onClick={() => handleEditClick(item)}>
                  Update Status
                </Button>
                <Button size="sm" onClick={() => handleEditClick(item)}>
                  Went Outside
                </Button>
                <Button size="sm" onClick={() => handleEditClick(item)}>
                  Back Inside
                </Button>
              </div>
              <div className="bg-gray-50 border-b">
                <div className="flex items-center justify-between p-4 border-b">
                  {/* Left Section */}
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      Reservation #{item.id}
                    </CardTitle>
                    <div className="mt-2 space-y-1 text-sm">
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
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge variant={getPaymentVariant(item.payment_status)}>
                        {item.payment_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {item.total_price || 0}
                      </p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Name
                        </p>
                        <p className="text-base">
                          {item.customer?.first_name}{" "}
                          {item.customer?.last_name || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Mobile Number
                        </p>
                        <p className="text-base">
                          {item.customer?.mobile_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Branch
                        </p>
                        <p className="text-base">{item.branch?.branch_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reservation Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Start Time
                        </p>
                        <p className="text-base">
                          {formatDateTime(item.created_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          End Time
                        </p>
                        <p className="text-base">
                          {formatDateTime(item.end_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Payment
                        </p>
                        <p className="text-base font-semibold text-green-600">
                          {item.total_payment || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Barcodes */}
                {item.play_reservation_barcodes?.length > 0 && (
                  <section className="space-y-6">
                    {/* Barcode Cards */}
                    {item.play_reservation_barcodes.map((barcode, idx) => (
                      <div
                        key={barcode.id || idx}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        {/* Header Line: Name / Barcode */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-semibold text-gray-900">
                              {barcode.name}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                              {barcode.barcode.barcode_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
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
                            {barcode.status !== "COMPLETED" && (
                              <Button
                                onClick={() =>
                                  handleSingleBarcodeUpdate(barcode.id)
                                }
                                disabled={patchHandlerloading}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Extra Time List */}
                        {barcode.playReservationBarCodeExtraTimes?.length >
                          0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Extra Time:
                            </h4>
                            <div className="space-y-1">
                              {barcode.playReservationBarCodeExtraTimes.map(
                                (extraTime, idx) => (
                                  <div
                                    key={extraTime.id || idx}
                                    className="text-sm text-gray-600 pl-4"
                                  >
                                    <span className="font-medium">
                                      {idx + 1}.
                                    </span>
                                    {formatHourMin(
                                      extraTime.start_hour,
                                      extraTime.start_min
                                    )}{" "}
                                    -
                                    {formatHourMin(
                                      extraTime.end_hour,
                                      extraTime.end_min
                                    )}
                                    <span className="text-gray-500 ml-2">
                                      ({extraTime.extra_minutes} min -
                                      {extraTime.extra_minute_price})
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Went Outside Records */}
                        {barcode.WentOutsideTracker?.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Went Outside Records:
                            </h4>
                            <div className="space-y-1">
                              {barcode.WentOutsideTracker.map((track, idx) => (
                                <div
                                  key={track.id || idx}
                                  className="text-sm text-gray-600 pl-4"
                                >
                                  <span className="font-medium">
                                    {idx + 1}.
                                  </span>

                                  {track.out_hour ? (
                                    <span>
                                      {" / "}
                                      Out:{" "}
                                      {formatHourMin(
                                        track.out_hour,
                                        track.out_min
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 ml-2">
                                      (Out: Not Recorded)
                                    </span>
                                  )}
                                  {track.in_hour ? (
                                    <span>
                                      {" "}
                                      In:{" "}
                                      {formatHourMin(
                                        track.in_hour,
                                        track.in_min
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 ml-2">
                                      (IN: IN Recorded)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
                          {barcode.completed_at && (
                            <span className="text-green-600">
                              Completed: {formatDateTime(barcode.completed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </div>
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
