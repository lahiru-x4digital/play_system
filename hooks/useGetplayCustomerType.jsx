"use client"
import api from "@/services/api";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const useGetplayCustomerType = (open) => {
  
  const [params, setParams] = useState({

  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);


  const loadData = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        "play/customer-type",
        {
          params: params,
          signal: controller.signal,
        }
      );
    
      setData(response.data);

    } catch (err) {
      // Skip state updates if the request was aborted
      if (controller.signal.aborted) {
        return;
      }

      // Skip cancellation errors
      if (
        axios.isCancel(err) ||
        err.code === 'ERR_CANCELED' ||
        err.message?.includes('canceled') ||
        err.name === 'CanceledError' ||
        err.message?.includes('aborted')
      ) {
        return;
      }

      // Handle actual errors
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'An error occurred while fetching tracking data';

      setError(errorMessage);
      setData([]);

    } finally {
      setLoading(false);
    }
  }, [params]);




  useEffect(() => {
    if(open){
      loadData();
    }
    
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [loadData, open]);

  return {
    customerTypes:data,
    customerTypesLoading:loading,
    customerTypesError:error,
    customerTypesRefresh: loadData,
  };
};

export default useGetplayCustomerType;