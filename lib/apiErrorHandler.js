// src/utils/apiErrorHandler.js

import toast from "react-hot-toast";

export const showApiError = (error, defaultMessage = "An error occurred") => {
  const message =
    error.response?.data?.message || error?.message || defaultMessage;
  toast.error(message);
};
