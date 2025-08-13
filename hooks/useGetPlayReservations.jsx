"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import axios from "axios";
import api from "@/services/api";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import useSessionUser from "@/lib/getuserData";
import useIsAdmin from "@/lib/getuserData";

const useGetPlayReservations = () => {
  //use null or [] base on scenario
  const user = useSessionUser();
  const isAdmin = useIsAdmin();
  const [dataList, SetDataList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState({
    pageSize: 10,
    page: 1,
    search: null,
    branch_id: user?.branchId || null,
    order_id: null,
    time_duration_id: null,
    start_date: null,
    end_date: null,
    mobile_number: null,
    ress_status: null,
    reservationStatus: null,
  });
  const abortControllerRef = useRef(null);
  // console.log("PARAMS", params);
  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      const response = await api.get(`play/play-reservation`, {
        params: {
          ...paramsNullCleaner(params),
          skip: (params.page - 1) * params.pageSize,
          limit: params.pageSize,
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
    playReservationsLimit: params.pageSize,
    playReservations: dataList,
    currentPage: params.page,
    playReservationsTotalPages: Math.ceil(totalCount / params.pageSize),
    playReservationsLoading: loading,
    playReservationsError: error,
    playReservationsTotalCount: totalCount,
    playReservationsPageNavigation: handlePageNavigation,
    playReservationsSearch: setParamsData,
    playReservationsRefres: loadData,
    playReservationsChangePageSize: changePageSize,
  };
};

export default useGetPlayReservations;
