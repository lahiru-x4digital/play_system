import api from "@/services/api";
import { useEffect, useState } from "react";

export const useAxiosDelete = () => {
  const [deleteHandlerloading, setDeleteHandlerLoading] = useState(false);
  const [deleteHandlerError, setDeleteHandlerError] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates on unmounted components
      setDeleteHandlerLoading(false);
      setDeleteHandlerError(false);
    };
  }, []);
  const deleteHandler = async (url) => {
    setDeleteHandlerLoading(true);
    setDeleteHandlerError(false);

    try {
      const response = await api.delete(`play/${url}`);
      return response;
    } catch (error) {
      setDeleteHandlerError(true);
      throw error;
    } finally {
      setDeleteHandlerLoading(false);
    }
  };
  return { deleteHandlerloading, deleteHandlerError, deleteHandler };
};
