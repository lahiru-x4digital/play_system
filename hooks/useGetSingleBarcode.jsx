"use client"
import { useState, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import axios from "axios";
import api from "@/services/api";


const useGetSingleBarcode = () => {
  //use null or [] base on scenario
  const [data, SetData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const abortControllerRef = useRef(null);

  const loadData = async (barcodeNumber,branch_id) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      const response =
        await api.get(`play/generate-code`, {
          params: {
            barcode_number: barcodeNumber,
            branch_id:branch_id
          },
          signal: controller.signal,
        });
      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        SetData(response.data?.barcodes[0]||null);
        
      }

      // setTotalCount(response.data.count);
    } catch (err) {
      // Check if the error is a cancellation
      if (axios.isCancel(err)) {
        return;
      }
      // Only update error state if this request wasn't aborted
      if (!controller.signal.aborted) {
        SetData(null);
        extractErrorMessage(err);
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }

 
  return {
    barcode: data,
    barcodeLoading: loading,
    barcodeError: error,
    barcodeRefresh: loadData,
  };
};

export default useGetSingleBarcode;
