import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScanReservationDialog } from "./ScanReservationDialog";
import { Button } from "../ui/button";
import { Eye, Printer, Pencil, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrintDialog } from "../booking/PrintDialog";
import { getEndTime } from "@/lib/getEndTime";
import { BookingEditDialog } from "../booking/BookingEditDialog";
import TimerCountDown from "../common/TimerCountDown";
import { utcToTimeConvert } from "@/utils/time-converter";

const PlayReservationTable = ({ data = [], playReservationsLoading }) => {
  const router = useRouter();
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleScanClick = (reservationId) => {
    setSelectedReservationId(reservationId);
    setScanDialogOpen(true);
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    setEditDialogOpen(open);
    if (!open) {
      setSelectedBooking(null);
      onRefresh?.();
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Total Price</TableHead>
              {/* <TableHead>Total Payment</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="flex flex-col">
                    <span>
                      {item.customer
                        ? `${item.customer.first_name || ""} ${
                            item.customer.last_name || ""
                          }`
                        : "-"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.customer ? item.customer.mobile_number : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.branch ? `${item.branch.branch_name}` : "-"}
                  </TableCell>
                  <TableCell>
                    {item.total_price != null ? item.total_price : "-"}
                  </TableCell>
                  {/* <TableCell>
                    {item.total_payment != null ? item.total_payment : "-"}
                  </TableCell> */}
                  <TableCell>
                    {item.status != null ? item.status : "-"}
                  </TableCell>
                  <TableCell>
                    {item.payment_status != null ? item.payment_status : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.created_date
                      ? new Date(item.created_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                          }
                        )
                      : "-"}
                    {/* <TimerCountDown
                      status={item.status}
                      startTime={item.created_date}
                      duration={item?.play_pricing?.duration || 0}
                      endTime={item.end_time}
                    /> */}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2 w-64">
                      {item.play_reservation_barcodes.map((barcode, index) => (
                        <div
                          key={barcode.id}
                          className="p-1 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-gray-900">
                              {barcode.name}/{" "}
                              <TimerCountDown
                                status={item.status}
                                start_hour={barcode.start_hour}
                                start_min={barcode.start_min}
                                end_hour={barcode.end_hour}
                                end_min={barcode.end_min}
                              />
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 rounded font-mono">
                              #{barcode.barcode_number}
                            </span>
                          </div>

                          {/* Time & Duration */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              {utcToTimeConvert(barcode.start_time)} -{" "}
                              {utcToTimeConvert(barcode.end_time)}
                            </span>
                            {barcode.duration && (
                              <span className="text-xs bg-blue-100 text-blue-700 rounded font-medium">
                                {barcode.duration}m
                              </span>
                            )}
                          </div>

                          {/* Timer */}
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={() => handleEditClick(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={() => handleScanClick(item.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={() => {
                          //navigate to the reservation id page
                          router.push(`/dashboard/booking/${item.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Print Dialog */}
        <PrintDialog
          reservation_id={selectedReservationId}
          open={scanDialogOpen}
          onOpenChange={setScanDialogOpen}
        />

        {/* Edit Booking Dialog */}
        <BookingEditDialog
          open={editDialogOpen}
          onOpenChange={handleDialogOpenChange}
          bookingData={selectedBooking}
          onSave={handleSaveBooking}
        />
      </div>
    </>
  );
};

export default PlayReservationTable;
