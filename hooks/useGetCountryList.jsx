"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import { countryService } from "@/services/country.service";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import { discountService } from "@/services/discount.service";

const useGetCountryList = () => {
  const [dataList, setDataList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState({
    pageSize: 10,
    page: 1,
    search: null,
    country_id: null,
    brand_id: null,
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
     
      const response = await discountService.getCountries();
      if (!controller.signal.aborted) {
        console.log(response)
        setDataList(response.data || []);
        setTotalCount(response.total || 0);
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
  }, [params]);

  const setParamsData = (newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  useEffect(() => {
    loadData();
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
      pageSize,
    }));
  }, []);

  // Pagination logic (client-side, since getAllBranchesWithoutFiles returns all by default)
  const paginatedList = dataList.slice(
    (params.page - 1) * params.pageSize,
    params.page * params.pageSize
  );
  const totalPages = Math.ceil(totalCount / params.pageSize);

  return {
    countryListLimit: params.pageSize,
    countryList: paginatedList,
    currentPage: params.page,
    totalPages,
    countryListLoading: loading,
    countryListError: error,
    countryListTotalCount: totalCount,
    countryListPageNavigation: handlePageNavigation,
    countryListSearch: setParamsData,
    countryListRefresh: loadData,
    countryListChangePageSize: changePageSize,
  };
};

export default useGetCountryList; 