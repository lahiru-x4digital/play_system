// src/utils/apiErrorHandler.js
import { toast } from "@/components/ui/use-toast";

export const showApiError = (error, defaultMessage = "An error occurred") => {
  const message =
    error.response?.data?.message || error?.message || defaultMessage;

  toast({
    variant: "destructive",
    title: "",
    description: message,
  });

  return {
    success: false,
    message,
  };
};
