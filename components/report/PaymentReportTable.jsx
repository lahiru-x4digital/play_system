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
              <TableHead>Payment ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No payments found
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
                    {item.amount != null ? `$${item.amount}` : "-"}
                  </TableCell>
                  <TableCell>
                    {item.payment_method || "-"}
                  </TableCell>
                  <TableCell>
                    {item.status || "-"}
                  </TableCell>
                  <TableCell>
                    {item.payment_status || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })
                      : "-"}
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
