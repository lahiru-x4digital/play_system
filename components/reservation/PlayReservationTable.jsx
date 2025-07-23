import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PlayReservationTable = ({ data = [], onRefresh }) => {
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
            <TableHead>Created at</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                  {/* Future: Add actions like view/edit/cancel */}
                  <button className="px-2 py-1 border rounded text-sm hover:bg-gray-100" onClick={onRefresh}>
                    Scan
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default PlayReservationTable;
