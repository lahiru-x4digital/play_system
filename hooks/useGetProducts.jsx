"use client";
import { useState, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import api from "@/services/api";

const useGetProducts = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
 
  const abortControllerRef = useRef(null);

  const loadData = async (params) => {
    //PARAMS
    // branch_id,name
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
     
      const response =
        await api.get(`play/pricing/product`, {
          params: {
            ...paramsNullCleaner(params),
          },
          signal: controller.signal,
        });
      if (!controller.signal.aborted) {
        // console.log(response.data)
        setDataList(response.data || []);
      
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setDataList([]);
        extractErrorMessage(err);
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }




  return {
    productsList: dataList,
    productsListLoading: loading,
    productsListError: error,
    productsListRefresh: loadData,
  };
};

export default useGetProducts; 