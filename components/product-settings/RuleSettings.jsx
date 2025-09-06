"use client";
import { AddRuleForm } from "@/components/settings/reservation-rule/reservation-rule-form";
import { EditRuleForm } from "@/components/settings/reservation-rule/edit-rule-form";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { bookingService } from "@/services/booking.service";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Pencil } from "lucide-react";
import SelectBranch from "@/components/common/selectBranch";

// Helper to format date as YYYY/MM/DD
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(date.getDate()).padStart(2, "0")}`;
}

export default function RuleSettings() {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editRule, setEditRule] = useState(null);
  const [branchId, setBranchId] = useState(1);

  async function fetchRules() {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getReservationRules({
        branch_id: branchId,
      });
      setRules(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchRules();
  }, [branchId]);

  // Pagination logic
  const total = rules.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedRules = rules.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Update rule in state after edit
  const handleEditSuccess = (updatedRule) => {
    setRules((rules) =>
      rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule))
    );
    setEditRule(null);
  };

  return (
    <div>
      <div className="flex gap-2 items-end">
        <AddRuleForm
          open={open}
          onOpenChange={setOpen}
          onSuccess={fetchRules}
          branchId={branchId}
        />
        <SelectBranch value={branchId} onChange={setBranchId} />
        <Button
          onClick={() => setOpen(true)}
          className="rounded-md hover:cursor-pointer"
        >
          Add Reservation Rule
        </Button>
      </div>
      <div className="mt-6">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="border-2 rounded-lg">
            <Table>
              <TableCaption>Reservation Rules</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Slot Period (min)</TableHead>
                  <TableHead>Max/Slot</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>{rule.branch?.branch_name || "-"}</TableCell>
                    <TableCell>{formatDate(rule.start_date)}</TableCell>
                    <TableCell>{formatDate(rule.end_date)}</TableCell>
                    <TableCell>{rule.start_time}</TableCell>
                    <TableCell>{rule.end_time}</TableCell>
                    <TableCell>{rule.price ?? "-"}</TableCell>
                    <TableCell>{rule.slot_booking_period ?? "-"}</TableCell>
                    <TableCell>
                      {rule.maximum_booking_per_slot ?? "-"}
                    </TableCell>
                    <TableCell>{rule.is_active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button
                        variant={"ghost"}
                        onClick={() => setEditRule(rule)}
                        className="px-3 py-1 text-sm HOVER:cusror-pointer"
                      >
                        <Pencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedRules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
                      No rules found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              total={total}
            />
          </div>
        )}
      </div>

      {editRule && (
        <EditRuleForm
          open={!!editRule}
          onOpenChange={() => setEditRule(null)}
          onSuccess={handleEditSuccess}
          rule={editRule}
        />
      )}
    </div>
  );
}
