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
              <TableHead>Total Pax</TableHead>
              <TableHead>Total Price</TableHead>
              {/* <TableHead>Total Payment</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-center">Remaining Time</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
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
                    {item?.play_reservation_customer_types?.reduce(
                      (sum, item) => sum + item.count,
                      0
                    )}
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
                    <TimerCountDown
                      status={item.status}
                      startTime={item.created_date}
                      duration={item?.play_pricing?.duration || 0}
                      endTime={item.end_time}
                    />
                  </TableCell>
                  <TableCell>
                    {item.created_date
                      ? new Date(item.created_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.end_time
                      ? new Date(item.end_time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </TableCell>
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
