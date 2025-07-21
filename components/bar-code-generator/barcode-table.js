import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const BarcodeTable = ({ data = [] }) => {
 
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Duration (Min)</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No barcodes found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.play_customer_type.name || '-'}</TableCell>
                <TableCell>{item.time_duration || '-'}</TableCell>
                <TableCell className="font-mono">{item.barcode_number || '-'}</TableCell>
                <TableCell>
                  {item.created_date 
                    ? new Date(item.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default BarcodeTable
