"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import QRCode from "react-qr-code";
import { Button } from "../ui/button";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import BandItem from "./BandItem";
export default function BarcodePrintView({ reservation = null }) {
  const printRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  return (
    <div className="">
      <Button
        className=""
        onClick={reactToPrintFn}
        style={{ marginBottom: "1rem" }}
      >
        Print All
      </Button>
      <div className="barcode-print-container grid grid-cols-4 gap-4">
        <div ref={printRef} className="print-area grid grid-cols-4 gap-4 w-96 ">
          {reservation?.barcodes?.map((barcode) => (
            <BandItem
              key={barcode.id}
              barcode={barcode}
              reservation={reservation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
