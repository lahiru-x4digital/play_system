"use server";

import { userService } from "@/services/user.service";

export async function verifyOTP(formData) {
  try {
    const email = formData.get("email");
    const otp = formData.get("otp");

    if (!email || !otp) {
      return {
        success: false,
        message: "Email and OTP are required",
      };
    }

    const result = await userService.verifyOTP({
      email,
      otp,
    });

    return result;
  } catch (error) {
    console.error("OTP verification error:", error);
    return {
      success: false,
      message: error.message || "Failed to verify OTP",
    };
  }
}
