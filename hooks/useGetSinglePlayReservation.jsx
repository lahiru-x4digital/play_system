"use client"
import { useState, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import axios from "axios";
import api from "@/services/api";


const useGetSinglePlayReservation = () => {
  //use null or [] base on scenario
  const [data, SetData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const abortControllerRef = useRef(null);

  const loadData = async (order_id) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      const response =
        await api.get(`play/play-reservation`, {
          params: {
            order_id: order_id,
          },
          signal: controller.signal,
        });
      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        SetData(response.data.data[0]||null);
        console.log("response",response)
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
    playReservation: data,
    playReservationLoading: loading,
    playReservationError: error,
    playReservationRefresh: loadData,
  };
};

export default useGetSinglePlayReservation;
