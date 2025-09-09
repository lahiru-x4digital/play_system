import api from "@/services/api";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
const formatDateToYMD = (dateString) => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};
const useGetCustomerTracking = ({ id, mobile }) => {

  const [params, setParams] = useState({
    customerId: id,
    mobile: mobile,
    startDate: formatDateToYMD(new Date()),
    endDate: formatDateToYMD(new Date()),
    actionType: "all",
    // multiEventType: undefined,
    pageSize: 10,
    currentPage: 1,
  });
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
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
      const pyaload = {
        customerId: params.customerId,
        startDate: formatDateToYMD(params.startDate),
        endDate: formatDateToYMD(params.endDate),
        ...(params?.actionType ? { actionTypes: params?.actionType } : {}),
        pageSize: params.pageSize,
        currentPage: params.currentPage,
      }
      const response = await api.get(
        "action-tracker/customer",
        {
          params: {
           ...pyaload
          },
          signal: controller.signal,
        }
      );
      setTrackingHistory(response.data.trackingHistory);
      setTotalItems(response?.data?.pagination?.totalItems||0);
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
      setTrackingHistory([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const setCustomerId = (customerId) => {
    setParams((prev) => ({ ...prev, customerId }));
  };

  const setActionTypeFilter = (actionType) => {
    setParams((prev) => ({ ...prev, actionType }));
  };

  const setDateRange = (dateRange) => {
    setParams(prev => ({
      ...prev,
      startDate: dateRange.start,
      endDate: dateRange.end,
      actionType: dateRange.actionType || prev.actionType,
    }));
  };
const loadMore = () => {
  setParams((prev) => ({ ...prev, pageSize: prev.pageSize + 10 }));
};
  useEffect(() => {
    if (params.customerId > 0) {
      loadData();
    }
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [loadData, params.customerId]);

  return {
    trackingHistory,
    totalItems,
    loading,
    error,
    params,
    setCustomerId,
    setActionTypeFilter,
    setDateRange,
    refresh: loadData,
    loadMore,
  };
};

export default useGetCustomerTracking;