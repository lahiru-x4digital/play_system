"use client";
import { ScanInput } from "@/components/common/ScanInput";
import useGetPlayReservationsOnCall from "@/hooks/useGetPlayReservationsOnCall";
import { useAxiosPatch } from "@/hooks/useAxiosPatch";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatHourMin } from "@/lib/combineHourMinute";

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
            <Card key={item.id || index} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Reservation #{item.id}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge variant={getPaymentVariant(item.payment_status)}>
                        {item.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {item.total_price || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
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

                {/* Customer Types Summary */}
                {item.play_reservation_customer_types &&
                  item.play_reservation_customer_types.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Customer Types
                      </h3>
                      <div className="grid gap-3 max-w-[300px]">
                        {item.play_reservation_customer_types.map(
                          (customerType, idx) => (
                            <div
                              key={customerType.id || idx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {customerType.playCustomerType?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Count: {customerType.count}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {customerType.price || 0}
                                </p>
                                <p className="text-sm text-gray-500">Amount</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                <Separator className="my-6" />

                {/* Barcodes */}
                {item.play_reservation_barcodes?.length > 0 && (
                  <section className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Active Barcodes
                      </h3>
                      <Button
                        onClick={() => handleMarkAllComplete(item.id)}
                        disabled={patchHandlerloading}
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {patchHandlerloading
                          ? "Updating..."
                          : "Mark All Complete"}
                      </Button>
                    </div>

                    {/* Barcodes List */}
                    <div className="grid gap-4">
                      {item.play_reservation_barcodes.map(
                        (reservationBarcode, idx) => (
                          <div
                            key={reservationBarcode.id || idx}
                            className="border rounded-xl shadow-sm p-5 bg-white"
                          >
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-base font-semibold text-gray-800">
                                {reservationBarcode.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    reservationBarcode.status === "COMPLETED"
                                      ? "success"
                                      : reservationBarcode.status === "ACTIVE"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="uppercase tracking-wide"
                                >
                                  {reservationBarcode.status}
                                </Badge>
                                {reservationBarcode.status !== "COMPLETED" && (
                                  <Button
                                    onClick={() =>
                                      handleSingleBarcodeUpdate(
                                        reservationBarcode.id
                                      )
                                    }
                                    disabled={patchHandlerloading}
                                    variant="outline"
                                    size="sm"
                                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {patchHandlerloading
                                      ? "Updating..."
                                      : "Complete"}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              {/* Barcode Number */}
                              <div>
                                <p className="text-gray-500">Barcode Number</p>
                                <p className="font-mono font-medium">
                                  {reservationBarcode.barcode.barcode_number}
                                </p>
                              </div>

                              {/* Duration */}
                              <div>
                                <p className="text-gray-500">Time Duration</p>
                                <p className="font-medium">
                                  {reservationBarcode.initial_minutes} minutes
                                </p>
                              </div>

                              {/* Extra Time */}
                              {reservationBarcode.playReservationBarCodeExtraTimes.map(
                                (extraTime, idx) => (
                                  <div
                                    key={extraTime.id || idx}
                                    className="md:col-span-2 border rounded-lg p-3 bg-gray-50"
                                  >
                                    <p className="text-gray-500 mb-1">
                                      Extra Time
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium">
                                        {formatHourMin(
                                          extraTime.start_hour,
                                          extraTime.start_min
                                        )}{" "}
                                        →{" "}
                                        {formatHourMin(
                                          extraTime.end_hour,
                                          extraTime.end_min
                                        )}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        min-{extraTime.extra_minutes}- Price-
                                        {extraTime.extra_minute_price}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}

                              {/* Outside Tracker */}
                              {reservationBarcode.WentOutsideTracker.map(
                                (track, idx) => (
                                  <div
                                    key={track.id || idx}
                                    className="md:col-span-2 border rounded-lg p-3 bg-yellow-50"
                                  >
                                    <p className="text-gray-500 mb-1">
                                      Outside Tracker
                                    </p>
                                    <div className="flex flex-col text-sm space-y-1">
                                      <span className="font-medium">
                                        In:{" "}
                                        {formatHourMin(
                                          track.in_hour,
                                          track.in_min
                                        )}
                                      </span>
                                      {track.out_hour && (
                                        <span className="font-medium">
                                          Out:{" "}
                                          {formatHourMin(
                                            track.out_hour,
                                            track.out_min
                                          )}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {track.extra_minutes} min ·
                                        {track.extra_minute_price}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}

                              {/* Completed At */}
                              {reservationBarcode.completed_at && (
                                <div className="md:col-span-2">
                                  <p className="text-gray-500">Completed At</p>
                                  <p className="font-medium text-green-600">
                                    {formatDateTime(
                                      reservationBarcode.completed_at
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}
              </CardContent>
            </Card>
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
    </div>
  );
}
