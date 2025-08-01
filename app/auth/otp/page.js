"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { verifyOTP } from "@/actions/auth/verify-otp";
import { userService } from "@/services/user.service";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";
import Image from "next/image";

export default function OTPPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userType, setUserType] = useState(null);
  const { toast } = useToast();

  // Start countdown on component mount
  useEffect(() => {
    // Start with 30 seconds cooldown
    setCountdown(30);

    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        console.log("Otp session", session);

        if (session?.user) {
          setUserType(session.user.user_type);

          // Check if OTP is already verified
          const otpVerified = localStorage.getItem('otpVerified') === 'true';
          if (otpVerified) {
            // Redirect to appropriate dashboard based on user type
            if (session.user.user_type === "ADMIN") {
              router.push("/dashboard");
            }
            // if (session.user.user_type === "SUPERADMIN") {
            //   router.push("/dashboard/customers");
            // } else if (session.user.user_type === "BRANCH_USER") {
            //   router.push("/dashboard/reservations");
            // }
            // else if (session.user.user_type === "USER") {
            //   router.push("/dashboard/reservations");
            // }
            // else if (session.user.user_type === "ORGANIZATION_USER") {
            //   router.push("/dashboard/reservations");
            // }
          }
        }
      } catch (error) {
        console.error('Error getting user session data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
      }
    };

    getUserData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", session?.user?.email);
      formData.append("otp", otp);

      const result = await verifyOTP(formData);

      if (result.success) {
        // Set OTP verification status in localStorage
        localStorage.setItem('otpVerified', 'true');
        if (userType === "ADMIN") {
          router.push("/dashboard");
        }
        // if (userType === "SUPERADMIN") {
        //   router.push("/dashboard/customers");
        // } else if (userType === "BRANCH_USER") {
        //   router.push("/dashboard/reservations");
        // } else if (userType === "BRANCH_MANAGER") {
        //   router.push("/dashboard/reservations/reservation-rule");
        // }
        // else if (userType === "ADMIN") {
        //   router.push("/dashboard/settings/brands");
        // } else if (userType === "USER") {
        //   router.push("/dashboard/reservations");
        // }
        // else if (userType === "ORGANIZATION_USER") {
        //   router.push("/dashboard/reservations");
        // }
      } else {
        setError(result.message || "Failed to verify OTP");
      }
    } catch (error) {
      setError("An error occurred while verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      // Clear OTP verification status
      localStorage.removeItem('otpVerified');

      // Sign out from next-auth
      await signOut({ redirect: false });

      // Redirect to login
      router.push('/auth');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still redirect even if there's an error
      router.push('/auth');
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast({
        title: "Please wait",
        description: `Please wait ${countdown} seconds before requesting a new OTP`,
        variant: "default"
      });
      return;
    }

    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "No email found in session. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    // Get the password from session storage (it was stored during login)
    const password = sessionStorage.getItem('tempPassword');
    if (!password) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      await signOut({ redirect: false });
      router.push('/auth');
      return;
    }

    try {
      setIsResending(true);
      toast({
        title: "Sending OTP",
        description: "Sending a new OTP to your email...",
        variant: "default"
      });

      // Use the userService to resend OTP by logging in again
      const { success, message } = await userService.resendOTP({
        email: session.user.email,
        password: password
      });

      if (success) {
        toast({
          title: "Success",
          description: message || "New OTP has been sent to your email",
          variant: "default"
        });
        // Reset countdown to 30 seconds
        setCountdown(30);
      } else {
        throw new Error(message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);

      // More specific error handling
      let errorMessage = error.message || "An error occurred while resending OTP";
      let errorTitle = "Error";

      // Customize error messages based on the error
      if (error.message.includes("Network")) {
        errorTitle = "Connection Error";
      } else if (error.message.includes("500") || error.message.includes("Server")) {
        errorTitle = "Server Error";
        errorMessage = "The server encountered an error. Please try again later.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-screen h-screen flex min-h-svh flex-col items-center justify-center bg-background  bg-cover bg-center">
      <div className="absolute top-0 left-0 w-full h-screen " />
      <div className="w-screen h-screen flex items-center justify-evenly px-[72px] py-[32px] gap-[32px] z-10">
        {/* <Image src="/re_logo.png" alt="logo" width={461} height={144} /> */}
        <div className="w-[521px] bg-[#fff] rounded-[10px] flex flex-col justify-center items-center px-[32px] py-[48px] gap-[32px] border-2">
          <div className="flex flex-col items-center justify-center leading-[22px] gap-[16px]">
            <h1 className="text-[30px] font-semibold">Enter OTP</h1>
            <p className="text-[14px] text-[#6B6E73] text-center">
              Please enter the OTP sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[32px]">
            <div className="flex flex-col gap-[32px]">
              <Input
                className="w-full h-[56px] bg-[#EBEBEB] hover:border-[#6B6E73] hover:border-[1px] focus:border-[#FF6B3D] focus:border-[1px] pt-[8px] pb-[24px] px-[8px] placeholder:text-[#292A2E] placeholder:text-[12px] placeholder:uppercase placeholder:absolute placeholder:top-2 placeholder:left-2"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              className="w-full h-[56px] p-[8px] bg-[#FF6B3D] hover:bg-[#FE3F11] active:bg-[#EF2607] hover:border-[#FF6B3D] hover:border-[1px] text-[#fff] text-[16px] font-medium"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className="w-full text-center text-[14px] font-medium">
              <Button
                variant="link"
                className="text-[#FF6B3D] hover:text-[#FE3F11] hover:no-underline text-[14px] font-medium p-0 h-auto"
                onClick={handleBackToLogin}
                disabled={isLoading}
                type="button"
              >
                ← Back to Login
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}