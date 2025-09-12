"use client";

import { useEffect } from "react";

export default function LocalStorageSync({ userId }) {
  console.log("userId", userId);
  useEffect(() => {
    if (userId) {
      const idStr = userId.toString();
      const hidden = btoa(idStr); // encode to Base64
      localStorage.setItem("user-token", hidden);
    } else {
      localStorage.removeItem("user-token");
    }
  }, [userId]);

  return null; // No UI needed
}
