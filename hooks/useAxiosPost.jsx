import api from "@/services/api";
import { useEffect, useState } from "react";

export const useAxiosPost = () => {
  const [postHandlerloading, setPostHandlerLoading] = useState(false);
  const [postHandlerError, setpostHandlerError] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates on unmounted components
      setPostHandlerLoading(false);
      setpostHandlerError(false);
    };
  }, []);
  const postHandler = async (url, data) => {
    setPostHandlerLoading(true);
    setpostHandlerError(false);

    try {
      const response = await api.post(`play/${url}`, data);
      return response;
    } catch (error) {
      setpostHandlerError(true);
      throw error;
    } finally {
      setPostHandlerLoading(false);
    }
  };
  return { postHandlerloading, postHandlerError, postHandler };
};
