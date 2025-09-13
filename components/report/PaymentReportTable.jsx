import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";

const PaymentReportTable = ({ data = [], loading }) => {
  const router = useRouter();

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reservation Date</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell className="font-medium">
                    {item.play_reservation?.id || "-"}
                  </TableCell>
                  <TableCell className="flex flex-col">
                    <span className="font-medium">
                      {item.play_reservation?.customer
                        ? `${item.play_reservation.customer.first_name || ""} ${
                            item.play_reservation.customer.last_name || ""
                          }`.trim()
                        : "-"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.play_reservation?.customer?.mobile_number || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.play_reservation?.reservation_date
                      ? new Date(
                          item.play_reservation.reservation_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.amount != null ? item.amount : "-"}
                  </TableCell>
                  <TableCell>
                    {item.payment_method?.method_name || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default PaymentReportTable;
