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
import { ProductSettingsTab } from "@/components/product-settings/product-settings-tab";

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

export default function page() {
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
      <ProductSettingsTab />
    </div>
  );
}
