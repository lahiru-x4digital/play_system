"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import { countryService } from "@/services/country.service";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import { discountService } from "@/services/discount.service";
import { brandService } from "@/services/brand.service";

const useGetBrandList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef(null);

  const loadData = async (countryId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
     
      const response = await brandService.getAllBrandsWithoutFiles({ country_id: countryId });
      if (!controller.signal.aborted) {
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
    brandList: dataList,
    brandListLoading: loading,
    brandListError: error,
    brandListRefresh: loadData,
  };
};

export default useGetBrandList; 