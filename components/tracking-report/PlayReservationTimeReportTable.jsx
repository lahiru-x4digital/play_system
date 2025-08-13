import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScanReservationDialog } from "../reservation/ScanReservationDialog"; // Import the dialog
import { Button } from "../ui/button";
import { Eye, Printer, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrintDialog } from "../booking/PrintDialog";
import { getEndTime } from "@/lib/getEndTime";
import TimerCountDown from "../common/TimerCountDown"

const PlayReservationTimeReportTable = ({ data = [],  }) => {
  const router = useRouter();
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [allData, setAllData] = useState([]);

  // Handle scan click
  const handleScanClick = (reservationId) => {
    setSelectedReservationId(reservationId);
    setScanDialogOpen(true);
  };

 
  // Handle export to Excel
  const exportToExcel = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      // First, update to get all records
      playReservationsChangePageSize(playReservationsTotalCount);
      
      // Wait for a short time to allow the parent component to fetch all data
      // This is a simple approach - you might want to implement a more robust solution
      // by passing a callback from the parent or using a state management solution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate Excel with all data
      generateExcel(allData.length > 0 ? allData : data);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Effect to update allData when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setAllData(prevData => {
        // Only update if we have more data than before
        return data.length > prevData.length ? data : prevData;
      });
    }
  }, [data]);

  return (
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
                  {item?.play_reservation_customer_types?.reduce((sum, item) => sum + item.count, 0)}
                </TableCell>
                <TableCell>
                  {item.total_price != null ? item.total_price : "-"}
                </TableCell>
                {/* <TableCell>
                  {item.total_payment != null ? item.total_payment : "-"}
                </TableCell> */}
                <TableCell className="text-center">
                  <TimerCountDown
                    startTime={item.created_date}
                    duration={item?.play_pricing?.duration || 0}
                    endTime={item.end_time}
                  />
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
                  {item?.end_time ? new Date(item.end_time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : "-"}
                </TableCell>
                <TableCell className="text-center">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Scan dialog outside the map, controlled by state */}
      <PrintDialog
        reservation_id={selectedReservationId}
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
      />
    </div>
  );
};

export default PlayReservationTimeReportTable;
