"use client"
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditPricingDialog from "./EditPricingDialog";

const PricingTable = ({ data = [], onRefresh }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Duration (Min)</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No pricing found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.play_customer_type?.name || '-'}</TableCell>
                <TableCell>{item.duration || '-'}</TableCell>
                <TableCell>{item.price != null ? item.price : '-'}</TableCell>
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
                  <EditPricingDialog pricing={item} onSuccess={onRefresh} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PricingTable; 