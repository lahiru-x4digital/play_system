"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import QRCode from "react-qr-code";
import { Button } from "../ui/button";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import BandItem from "./BandItem";
import toast from "react-hot-toast";

export default function BarcodePrintView({ reservation = null }) {
  const printRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    // A short delay to allow React to re-render before we grab the HTML
    await new Promise((resolve) => setTimeout(resolve, 50));

    const htmlContent = printRef.current.innerHTML;
    try {
      const res = await fetch("http://localhost:4000/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlContent,
        }),
      });

      const text = await res.text();
      console.log(text);
      toast.success("Sent to printer: Printed!");
    } catch (err) {
      console.error("Error sending HTML to server:", err);
      toast.error("Print failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  return (
    <div className="">
      <div className="flex gap-2">
        <Button
          className=""
          onClick={reactToPrintFn}
          style={{ marginBottom: "1rem" }}
        >
          Print All
        </Button>
        <Button
          className=""
          onClick={handleGeneratePdf}
          style={{ marginBottom: "1rem" }}
        >
          Quick Print
        </Button>
      </div>
      <div className="barcode-print-container grid grid-cols-4 gap-4">
        <div ref={printRef} className="print-area grid grid-cols-4 gap-4 w-96 ">
          {reservation?.play_reservation_barcodes?.map((barcode, idx) => (
            <div>
              <BandItem
                key={barcode.barcode_id}
                barcode={barcode}
                reservation={reservation}
                isGenerating={isGenerating}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
