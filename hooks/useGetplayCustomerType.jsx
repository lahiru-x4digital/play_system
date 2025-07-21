import api from "@/services/api";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { get } from "lodash";

const useGetCustomerTracking = () => {

  const [params, setParams] = useState({

  });
  const [trackingHistory, setTrackingHistory] = useState([]);
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
        "action-tracker/customer",
        {
          params: params,
          signal: controller.signal,
        }
      );
      const responsePosEvents = await api.get(
        "pos-event",
        {
          params: {
            mobile: params.mobile,
            startDate: formatDateToYMD(params.startDate),
            endDate: formatDateToYMD(params.endDate),
            multiEventType: params.multiEventType,
            limit: params.limit,
          },
          signal: controller.signal,
        }
      );

      const formatPosEventData = responsePosEvents.data?.events?.map((event) => {
        const mainDataObj = event.payload.find((p) => p.Main_Data) || {};
        return {
          ...event,
          action_type: event.eventType,
          action_data: {
            changes: [
              {
                key_name: "etlId",
                before: "",
                after: event.etlId
              },
              {
                key_name: "Business_Date",
                before: "",
                after: get(mainDataObj, "Main_Data.Business_Date", ""),
              },
            ],
            payload: event.payload || [],
          },
          createdAt: event.createdAt,
          id: event.id,
          action_type: event.eventType,
          user: {
            name: "System"
          }
        };
      });
      setTrackingHistory([...response.data, ...formatPosEventData]);

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

      if (process.env.NODE_ENV === 'development') {
        console.error('Error in useGetCustomerTracking:', {
          message: errorMessage,
          code: err.code,
          status: err.response?.status,
          url: err.config?.url
        });
      }
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
      endDate: dateRange.end
    }));
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
    loading,
    error,
    params,
    setCustomerId,
    setActionTypeFilter,
    setDateRange,
    refresh: loadData,
  };
};

export default useGetCustomerTracking;