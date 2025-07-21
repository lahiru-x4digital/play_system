"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import axios from "axios";
import api from "@/services/api";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";


const useGetBarCodes = () => {
  //use null or [] base on scenario
  const [dataList, SetDataList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState({
    pageSize: 10,
    page: 1,
    search: null,
    barcode_number: null,
    play_customer_type_id: null,
    time_duration: null,
  });
  const abortControllerRef = useRef(null);

  const loadData = useCallback(async () => {
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
            ...paramsNullCleaner(params),
          },
          signal: controller.signal,
        });
      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        SetDataList(response.data?.results);
        setTotalCount(response.data?.count);
        if (response.data?.count > 0) {
         
        } else {
         
        }
      }

      // setTotalCount(response.data.count);
    } catch (err) {
      // Check if the error is a cancellation
      if (axios.isCancel(err)) {
        return;
      }
      // Only update error state if this request wasn't aborted
      if (!controller.signal.aborted) {
        SetDataList([]);
        extractErrorMessage(err);
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  const setParamsData = (newParams) => {
    // use null to remove params
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };
  useEffect(() => {
    // Call loadData directly - it will handle its own cleanup
    loadData();
    // Return cleanup function for component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);
  const handlePageNavigation = useCallback((page) => {
    setParams((prev) => ({
      ...prev,
      page,
    }));
  }, []);
  const changePageSize = useCallback((pageSize) => {
    setParams((prev) => ({
      ...prev,
      pageSize: pageSize,
    }));
    ///* if you use functional prev state you do not need to add params to callback depandancy array
  }, []);
  return {
    barcodeListLimit: params.pageSize,
    barcodeList: dataList,
    barcodeListLoading: loading,
    barcodeListError: error,
    barcodeListTotalCount: totalCount,
    barcodeListPageNavigation: handlePageNavigation,
    barcodeListSearch: setParamsData,
    barcodeListRefres: loadData,
    barcodeListChangePageSize: changePageSize,
  };
};

export default useGetBarCodes;
