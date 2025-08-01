"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoginForm } from "@/components/login-form"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import Image from "next/image";
export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    // If user is authenticated (has session)
    if (session?.user) {
      // Check if 2FA is enabled for this user
      console.log("session", session)
      const is2faEnabled = session.user.is2fa;

      if (!is2faEnabled) {
        // 2FA is disabled, redirect directly to appropriate dashboard
        const userType = session.user.user_type;
        if (userType === "ADMIN") {
          router.push("/dashboard");
        }
        
        // if (userType === "SUPERADMIN") {
        //   router.push("/dashboard/customers");
        // } else if (userType === "BRANCH_USER") {
        //   router.push("/dashboard/reservations");
        // } else if (userType === "BRANCH_MANAGER") {
        //   router.push("/dashboard/reservations/reservation-rule");
        // } else if (userType === "ADMIN") {
        //   router.push("/dashboard/settings/brands");
        // } else if (userType === "USER") {
        //   router.push("/dashboard/reservations");
        // }
      } else {
        // 2FA is enabled, check if OTP is verified
        const otpVerified = isClient && localStorage.getItem('otpVerified') === 'true';

        if (otpVerified) {
          // User is authenticated and OTP is verified, redirect to appropriate dashboard
          const userType = session.user.user_type;
          if (userType === "ADMIN") {
            router.push("/dashboard");
          }
          // if (userType === "SUPERADMIN") {
          //   router.push("/dashboard/customers");
          // } else if (userType === "BRANCH_USER") {
          //   router.push("/dashboard/reservations");
          // } else if (userType === "BRANCH_MANAGER") {
          //   router.push("/dashboard/reservations/reservation-rule");
          // } else if (userType === "ADMIN") {
          //   router.push("/dashboard/settings/brands");
          // } else if (userType === "USER") {
          //   router.push("/dashboard/reservations");
          // }
        } else {
          // User is authenticated but OTP is not verified, redirect to OTP page
          router.push("/auth/otp");
        }
      }
    }
  }, [session, router, status, isClient]);

  // Only render if not authenticated or while checking status
  return (
    <div className="w-screen h-screen flex min-h-svh flex-col items-center justify-center bg-white">
      <div className="absolute top-0 left-0 w-full h-screen" />
      <div className="w-screen h-screen flex items-center justify-evenly px-[72px] py-[32px] gap-[32px] z-10">
        {/* <Image src="/re_logo.png" alt="logo" width={461} height={144} />/ */}
        <Card>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}