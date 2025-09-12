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
import EditExtraPricingDialog from "./EditExtraPricingDialog";

const ExtraHoursPricingTable = ({ data = [], onRefresh }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState(null);

  const handleEditClick = (item) => {
    setSelectedPricing(item);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPricing(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rule Name</TableHead>
            <TableHead>Duration (Min)</TableHead>
            <TableHead>Price</TableHead>
            {/* <TableHead>Created at</TableHead> */}
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No pricing found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.play_reservation_rule?.name || "-"}
                </TableCell>
                <TableCell>{item.duration || "-"}</TableCell>
                <TableCell>{item.price != null ? item.price : "-"}</TableCell>
                {/* <TableCell>
                  {item.created_date
                    ? new Date(item.created_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </TableCell> */}
                <TableCell>
                  <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                  {/* <button
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    onClick={() => deleteHandler(`pricing/?id=${item.id}`)}
                  >
                    Delete
                  </button> */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <EditExtraPricingDialog
        pricing={selectedPricing || {}}
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        onSuccess={() => {
          handleDialogClose();
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default ExtraHoursPricingTable;
