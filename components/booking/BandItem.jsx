import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { getEndTime } from "@/lib/getEndTime";
import { combineHourAndMinute } from "@/utils/time-converter";

export default function BandItem({
  barcode,
  reservation,
  isGenerating = false,
}) {
  const printRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  const handleSinglePrint = () => {
    setTimeout(() => {
      reactToPrintFn();
    }, 100); // Wait for DOM update
  };

  if (!barcode || !reservation) return null;
  // console.log(barcode);
  return (
    <div className="flex flex-col items-center justify-center">
      {!isGenerating && (
        <Button
          className={"mb-2 btn-print-barcode"}
          onClick={handleSinglePrint}
          variant="outline"
          size="icon"
        >
          <Printer />
        </Button>
      )}
      <div
        ref={printRef}
        className="barcode-band"
        style={{
          width: "25mm",
          height: "250mm",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ccc",
          margin: "3mm 1.5mm",
          pageBreakInside: "avoid",
        }}
      >
        {/* Show reservation first name */}
        {reservation?.customer?.first_name && (
          <div
            style={{
              fontSize: "10pt",
              textAlign: "center",
              margin: "1rem",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              letterSpacing: "2px",
              height: "100px", // adjust as needed
              whiteSpace: "nowrap",
            }}
          >
            {reservation.customer.first_name}
          </div>
        )}
        <div
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {new Date(reservation?.reservation_date).toLocaleDateString()}
        </div>
        {/* <div style={{ fontSize: '8pt', wordBreak: 'break-all', textAlign: 'center' }}>From</div> */}
        {barcode.reservation_rule_id && (
          <div
            style={{
              fontSize: "8pt",
              wordBreak: "break-all",
              textAlign: "center",
            }}
          >
            {combineHourAndMinute(barcode?.start_hour, barcode?.start_min)}-{" "}
            {combineHourAndMinute(barcode?.end_hour, barcode?.end_min)}
          </div>
        )}
        {/* <div style={{ fontSize: '8pt', wordBreak: 'break-all', textAlign: 'center' }}>To</div> */}
        <div
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {/* {getEndTime(
            barcode?.createdAt,
            barcode?.initial_minutes,
            barcode?.extra_minutes || 0
          )} */}
        </div>
        <QRCode
          value={barcode?.barcode?.barcode_number}
          size={60}
          style={{ marginBottom: "2mm" }}
        />
        <div
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {barcode?.barcode?.barcode_number}
        </div>
        <div
          className="text-wrap"
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {/* {barcode?.barcode?.play_customer_type?.name} */}
        </div>
        <p className="text-center text-wrap text-sm text-gray-500 font-semibold">
          {barcode.name}
        </p>
      </div>
    </div>
  );
}
