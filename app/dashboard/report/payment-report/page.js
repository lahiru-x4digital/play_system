"use client";
import React, { useEffect, useState } from "react";
import PaymentReportTable from "@/components/report/PaymentReportTable";
import { Pagination } from "@/components/ui/pagination";
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
      const today = new Date().toISOString().split("T")[0];
      const finalParams = {
        ...params,
        start_date: params.start_date || today,
        end_date: params.end_date || today,
      };
      const response = await api.get(`play/report/payment-method`, {
        params: {
          skip: (currentPage - 1) * pageSize,
          limit: pageSize,
          ...paramsNullCleaner(finalParams),
        },
      });

      const paymentsData = response?.data?.data || [];
      setPayments(paymentsData);
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
      "Reservation ID": item.play_reservation?.id || "-",
      "Customer Name": item.play_reservation?.customer
        ? `${item.play_reservation.customer.first_name || ""} ${
            item.play_reservation.customer.last_name || ""
          }`.trim()
        : "-",
      "Mobile Number": item.play_reservation?.customer?.mobile_number || "-",
      "Reservation Date": item.play_reservation?.reservation_date
        ? new Date(item.play_reservation.reservation_date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            }
          )
        : "-",
      "Payment Date": item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        : "-",
      Amount: item.amount || "-",
      "Payment Method": item.payment_method?.method_name || "-",
    }));

    console.log("Excel Data:", excelData); // Add this for debugging

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
              branch_id: branch,
              start_date: date,
              skip: 0,
              end_date: endDate,
              payment_method: paymentMethod,
              limit: 10000, // Large limit for export
            };
            try {
              const response = await api.get(`play/report/payment-method`, {
                params: {
                  ...paramsNullCleaner(payload),
                },
              });
              if (response?.data?.data) {
                generateExcel(response.data.data);
              }
            } catch (error) {
              console.error("Export error:", error);
            }
          }}
          onSubmit={(data) => {
            const { branch, date, endDate, paymentMethod } = data;
            setCurrentPage(1); // Reset to first page when filtering
            fetchPayments({
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
              <PaymentReportTable data={payments} loading={loading} />
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
