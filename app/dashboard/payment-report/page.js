"use client";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { PhoneNumberField } from "@/components/coustomer-mobile-input";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useGetTimeDurationPricing from "@/hooks/useGetTimeDurationPricing";
import { ADULTS_ID, KIDS_ID } from "@/utils/static-variables";
import { useSession } from "next-auth/react";
import SelectBranch from "@/components/common/selectBranch";
import useSessionUser, { useIsAdmin } from "@/lib/getuserData";
import { useAxiosPatch } from "@/hooks/useAxiosPatch";
import { useAxiosPost } from "@/hooks/useAxiosPost";
import PaymentReportTable from "@/components/report/PaymentReportTable";
import { Pagination } from "@/components/ui/pagination";
import { ReservationDialog } from "@/components/reservation/ReservationDialog";
import { AutoBookingDialog } from "@/components/booking/AutoBookingDialog";
import PaymentFilter from "@/components/common/PaymentFilter";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import api from "@/services/api";
import * as XLSX from "xlsx";

export default function PaymentReportPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPayments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get(`play/play-reservation`, {
        params: {
          skip: (currentPage - 1) * pageSize,
          limit: pageSize,
          ...paramsNullCleaner(params),
        },
      });
      // Flatten payments from reservations
      const flattenedPayments = response?.data?.data || [];
      setPayments(flattenedPayments);
      setTotalCount(response?.data?.total || 0);
      setTotalPages(response?.data?.pages || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load payments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const generateExcel = (exportData) => {
    const excelData = exportData.map((item) => ({
      "Payment ID": item.id,
      Customer: item.customer
        ? `${item.customer.first_name || ""} ${
            item.customer.last_name || ""
          }`.trim()
        : "-",
      Mobile: item.customer?.mobile_number || "-",
      Amount: item.amount || "-",
      "Payment Method": item.payment_method || "-",
      Status: item.status || "-",
      "Payment Status": item.payment_status || "-",
      Date: item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "-",
      Reference: item.reference_number || "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(
      wb,
      `payments_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div>
      <div className="space-y-4">
        <PaymentFilter
          onExport={async (data) => {
            const { branch, date, endDate, paymentMethod } = data;
            const payload = {
              search: null,
              branch_id: branch,
              order_id: null,
              start_date: date,
              skip: 0,
              end_date: endDate,
              payment_method: paymentMethod,
              limit: 10000, // Large limit for export
            };
            try {
              const response = await api.get(`play/play-reservation`, {
                params: {
                  ...paramsNullCleaner(payload),
                },
              });
              if (response?.data?.data) {
                // Payments are already flattened
                const flattenedPayments = response.data.data;
                generateExcel(flattenedPayments);
              }
            } catch (error) {}
          }}
          onSubmit={(data) => {
            const { branch, date, endDate, paymentMethod } = data;
            fetchPayments({
              search: null,
              branch_id: branch,
              start_date: date,
              end_date: endDate,
              payment_method: paymentMethod,
            });
          }}
        />
        <div className="rounded-md border">
          {loading ? (
            <div className="text-center py-8">Loading payments...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <PaymentReportTable
                data={payments}
                loading={loading}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                total={totalCount}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}