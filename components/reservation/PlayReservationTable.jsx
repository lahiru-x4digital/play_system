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
import * as XLSX from 'xlsx';

const PlayReservationTable = ({ 
  data = [], 
  onRefresh, 
  playReservationsChangePageSize, 
  playReservationsTotalCount, 
  playReservationsLoading 
}) => {
  const router = useRouter();
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isExporting, setIsExporting] = useState(false);


  const handleScanClick = (reservationId) => {
    setSelectedReservationId(reservationId);
    setScanDialogOpen(true);
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };
console.log("dataset",data);
  // Function to generate Excel file
  const generateExcel = (exportData) => {
    const excelData = exportData.map(item => ({
      'Reservation ID': item.id,
      'Customer': item.customer ? `${item.customer.first_name || ''} ${item.customer.last_name || ''}`.trim() : '-',
      'Mobile': item.customer?.mobile_number || '-',
      'Branch': item.branch?.branch_name || '-',
      'Total Pax': item.play_reservation_customer_types.reduce((sum, item) => sum + item.count, 0) || 0,
      'Total Price': item.total_price || '-',
      'Status': item.status || '-',
      'Start Time': item?.created_date ? new Date(item?.created_date).toLocaleString() : '-',
      'End Time': item.end_time ? new Date(item.end_time).toLocaleString() : '-',
      'Payment': item?.play_playment?.reduce((sum, item) => sum + item.amount, 0) || 0,
      'Payment Method': item?.play_playment?.[0]?.payment_method || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations');
    XLSX.writeFile(wb, `reservations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Handle export to Excel
  const exportToExcel = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      // First, update to get all records
      playReservationsChangePageSize(playReservationsTotalCount);
      
      // Wait for a short time to allow the parent component to fetch all data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate Excel with all data
      generateExcel(data?.length > 0 ? data : []);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
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
    <>
      <div className="flex justify-end p-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={exportToExcel}
          disabled={isExporting || playReservationsLoading}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export to Excel
            </>
          )}
        </Button>
      </div>
      
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
              <TableHead>Start Time</TableHead>
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
                    {item?.play_reservation_customer_types?.reduce((sum, item) => sum + item.count, 0)}
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
