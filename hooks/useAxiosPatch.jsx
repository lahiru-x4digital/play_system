import api from "@/services/api";
import { useEffect, useState } from "react";

export const useAxiosPatch = () => {
  const [patchHandlerloading, setpatchHandlerLoading] =
    useState(false);
  const [patchHandlerError, setpatchHandlerError] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates on unmounted components
      setpatchHandlerLoading(false);
      setpatchHandlerError(false);
    };
  }, []);
  const patchHandler = async (url, data) => {
    setpatchHandlerLoading(true);
    setpatchHandlerError(false);

    try {
      const responce = await api.patch(url, data);
      return responce;
    } catch (error) {
      setpatchHandlerError(true);

      throw error;
    } finally {
      setpatchHandlerLoading(false);
    }
  };
  return { patchHandlerloading, patchHandlerError, patchHandler };
};
