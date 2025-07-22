"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import axios from "axios";
import api from "@/services/api";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";


const useGetTimeDurationPricingInitial = (customer_type_id) => {
  //use null or [] base on scenario
  const [dataList, SetDataList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState({
    pageSize: 10,
    page: 1,
    search: null,
    play_customer_type_id: customer_type_id,
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
        await api.get(`play/pricing`, {
          params: {
            ...paramsNullCleaner(params),
            is_active:true
          },
          signal: controller.signal,
        });
      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        SetDataList(response.data?.data);
        setTotalCount(response.data?.total);
       
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
    timeDurationPricingLimit: params.pageSize,
    timeDurationPricing: dataList,
    currentPage: params.page,
    timeDurationPricingTotalPages: Math.ceil(totalCount / params.pageSize),
    timeDurationPricingLoading: loading,
    timeDurationPricingError: error,
    timeDurationPricingTotalCount: totalCount,
    timeDurationPricingPageNavigation: handlePageNavigation,
    timeDurationPricingSearch: setParamsData,
    timeDurationPricingRefres: loadData,
    timeDurationPricingChangePageSize: changePageSize,
  };
};

export default useGetTimeDurationPricingInitial;