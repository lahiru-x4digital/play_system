"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import { branchService } from "@/services/branch.service";
import { paramsNullCleaner } from "@/lib/paramsNullCleaner";
import { useIsAdmin } from "@/lib/getuserData";

const useGetBranches = (brandId,open) => {

  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState({
    // pageSize: 10,
    // page: 1,
    // search: null,
    // country_id: null,
    brand_id: brandId,
    branch_id: null,
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
      const filterParams = {
        ...paramsNullCleaner(params),
      };
      const response = await branchService.getAllBranchesWithoutFiles(filterParams)
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
  }, [params]);

  const setParamsData = (newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  useEffect(() => {
    if(open){
      loadData();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);



  return {

    branchList: dataList,
    branchListLoading: loading,
    branchListError: error,
    branchFilter: setParamsData,
    branchListRefresh: loadData,
  };
};

export default useGetBranches; 