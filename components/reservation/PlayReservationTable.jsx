"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScanReservationDialog } from "./ScanReservationDialog"; // Import the dialog
import { Button } from "../ui/button";
import { Eye, Printer, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrintDialog } from "../booking/PrintDialog";
import { getEndTime } from "@/lib/getEndTime";
import { BookingEditDialog } from "../booking/BookingEditDialog";

const PlayReservationTable = ({ data = [], onRefresh }) => {
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
      console.error('Failed to update booking:', error);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reservation ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Total Price</TableHead>
            {/* <TableHead>Total Payment</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Start At</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead className='text-center'>Action</TableHead>
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
                <TableCell>
                  {item.customer
                    ? `${item.customer.first_name || ""} ${
                        item.customer.last_name || ""
                      }`
                    : "-"}
                </TableCell>
                <TableCell>
                  {item.customer ? item.customer.mobile_number : "-"}
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
                  {item.created_date
                    ? new Date(item.created_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  {getEndTime(
                    item.created_date,
                    item?.play_pricing?.duration || 0
                  )}
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
  );
};

export default PlayReservationTable;
