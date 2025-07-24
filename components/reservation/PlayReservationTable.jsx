import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScanReservationDialog } from "./ScanReservationDialog"; // Import the dialog
import { Button } from '../ui/button';
import { Eye, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PrintDialog } from '../booking/PrintDialog';

const PlayReservationTable = ({ data = [], onRefresh }) => {
  const router = useRouter();
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const handleScanClick = (reservationId) => {
    setSelectedReservationId(reservationId);
    setScanDialogOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Total Payment</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No reservations found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>
                  {item.customer ? `${item.customer.first_name || ''} ${item.customer.last_name || ''}` : '-'}
                </TableCell>
                <TableCell>
                  {item.customer ? item.customer.mobile_number : '-'}
                </TableCell>
                <TableCell>
                  {item.branch ? `${item.branch.branch_name} (${item.branch.branch_code})` : '-'}
                </TableCell>
                <TableCell>{item.total_price != null ? item.total_price : '-'}</TableCell>
                <TableCell>
                  {item.total_payment != null ? item.total_payment : '-'}
                </TableCell>
                <TableCell>
                  {item.created_date
                    ? new Date(item.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => handleScanClick(item.id)}
                  >
                    <Printer/>
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100 mx-2"
                    onClick={() => {
                      //navigate to the reservation id page
                      router.push(`/dashboard/booking/${item.id}`)
                      
                    }}
                  >
                    <Eye/>
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
  )
}

export default PlayReservationTable;
