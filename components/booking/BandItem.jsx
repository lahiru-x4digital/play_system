import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { getEndTime } from "@/lib/getEndTime";

export default function BandItem({ barcode, reservation }) {
  const printRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  const handleSinglePrint = () => {
    setTimeout(() => {
      reactToPrintFn();
    }, 100); // Wait for DOM update
  };
  if (!barcode || !reservation) return null;
  console.log(barcode);
  return (
    <div className="flex flex-col items-center justify-center" key={barcode.id}>
      <Button
        className={"mb-2 btn-print-barcode"}
        onClick={handleSinglePrint}
        variant="outline"
        size="icon"
      >
        <Printer />
      </Button>
      <div
        ref={printRef}
        className="barcode-band"
        style={{
          width: "10 mm",
          height: "150mm",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ccc",
          marginBottom: "8mm",
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
          {new Date(barcode?.created_date).toLocaleDateString()}
        </div>
        {/* <div style={{ fontSize: '8pt', wordBreak: 'break-all', textAlign: 'center' }}>From</div> */}
        <div
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {new Date(barcode?.created_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        {/* <div style={{ fontSize: '8pt', wordBreak: 'break-all', textAlign: 'center' }}>To</div> */}
        <div
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {getEndTime(barcode?.created_date, barcode?.time_duration)}
        </div>
        <QRCode
          value={barcode.barcode_number}
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
          {barcode.barcode_number}
        </div>
        <div
          style={{
            fontSize: "8pt",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {barcode.play_customer_type?.name}
        </div>
      </div>
    </div>
  );
}
