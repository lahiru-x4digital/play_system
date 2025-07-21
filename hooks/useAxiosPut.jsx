import api from "@/services/api";
import { useEffect, useState } from "react";

export const useAxiosPut = () => {
  const [putHandlerloading, setputHandlerLoading] = useState(false);
  const [putHandlerError, setputHandlerError] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates on unmounted components
      setputHandlerLoading(false);
      setputHandlerError(false);
    };
  }, []);
  const putHandler = async (url, data) => {
    setputHandlerLoading(true);
    setputHandlerError(false);

    try {
      const responce = await api.put(url, data);
      return responce;
    } catch (error) {
      setputHandlerError(true);

      throw error;
    } finally {
      setputHandlerLoading(false);
    }
  };
  return { putHandlerloading, putHandlerError, putHandler };
};
