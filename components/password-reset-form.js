"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, Eye, EyeOff } from "lucide-react";
import { userService } from "@/services/user.service";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (!tokenParam) {
      router.push("/auth/forgot-password");
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  async function onSubmit(values) {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await userService.resetPassword({
        token,
        newPassword: values.newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth?reset=success");
      }, 2000);
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-[521px] flex flex-col justify-center items-center px-[32px] py-[48px] gap-[32px]">
      <div className="flex flex-col items-center justify-center leading-[22px] gap-[16px]">
        <h1 className="text-[30px] font-semibold">Set New Password</h1>
        <p className="text-[14px] text-[#6B6E73] text-center">
          Your new password must be different from previously used passwords
        </p>
      </div>

      <Form {...form}>
        <form
          className="w-full flex flex-col gap-[32px]"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-[32px]">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="w-full h-[56px] bg-[#EBEBEB] hover:border-[#6B6E73] hover:border-[1px] focus:border-[#FF6B3D] focus:border-[1px] pt-[8px] pb-[24px] px-[8px] placeholder:text-[#292A2E] placeholder:text-[12px] placeholder:uppercase placeholder:absolute placeholder:top-2 placeholder:left-2"
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        {...field}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 bottom-2 h-auto px-2 py-1 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="w-full h-[56px] bg-[#EBEBEB] hover:border-[#6B6E73] hover:border-[1px] focus:border-[#FF6B3D] focus:border-[1px] pt-[8px] pb-[24px] px-[8px] placeholder:text-[#292A2E] placeholder:text-[12px] placeholder:uppercase placeholder:absolute placeholder:top-2 placeholder:left-2"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        {...field}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 bottom-2 h-auto px-2 py-1 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className="w-full h-[56px] p-[8px] bg-[#FF6B3D] hover:bg-[#FE3F11] active:bg-[#EF2607] hover:border-[#FF6B3D] hover:border-[1px] text-[#fff] text-[16px] font-medium"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader className="mr-5 h-4 w-4 animate-spin" />}
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert className="border border-solid border-[#DF2324] text-[14px] text-[#292A2E]">
          <AlertDescription className="flex gap-[16px]">
            <IoIosCloseCircleOutline className="w-[24px] h-[24px] text-[#DF2324]" />
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border border-solid border-[#289128] text-[14px] text-[#292A2E]">
          <AlertDescription className="flex gap-[16px]">
            <IoIosCheckmarkCircleOutline className="w-[24px] h-[24px] text-[#289128]" />
            Your password has been successfully updated. You can now log in with
            your new password.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
