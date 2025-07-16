"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
// import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, Eye, EyeOff } from "lucide-react"
// import { Icons } from "@/components/ui/icons"

// Define validation schema using Zod
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export function LoginForm() {
  // Next.js router for programmatic navigation
  const router = useRouter()

  // State management for loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Initialize react-hook-form with Zod validation
  const form = useForm({
    // Connect Zod validation to react-hook-form
    resolver: zodResolver(formSchema),
    // Set initial form values
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Form submission handler
  async function onSubmit(values) {
    // Start loading state and clear any previous errors
    setIsLoading(true)
    setError("")

    try {
      // Attempt to sign in using NextAuth credentials provider
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: `${window.location.origin}`,
      })

      // Handle authentication errors
      if (result?.error) {
        console.log("Authentication error:", result.error)
        setError("Invalid email or password")
        return
      }

      // Clear any existing OTP verification status
      localStorage.removeItem('otpVerified');

      // Store password in sessionStorage for OTP resend functionality
      sessionStorage.setItem('tempPassword', values.password);

      // Clear the password from memory after a short delay
      setTimeout(() => {
        sessionStorage.removeItem('tempPassword');
      }, 5 * 60 * 1000); // Clear after 5 minutes

      // On successful login, redirect to OTP page
      router.push("/auth/otp")
    } catch (error) {
      // Handle unexpected errors and display user-friendly message
      setError(error.response?.data?.message || "An error occurred. Please try again.")
    } finally {
      // Always reset loading state
      setIsLoading(false)
    }
  }

  return (
    <div className="w-[521px] flex flex-col justify-center items-center px-[32px] py-[48px] gap-[32px]">

      <h1 className="text-[30px] font-semibold">Sign in to Restroengage</h1>


      <Form  {...form}>
        <form className="w-full flex flex-col gap-[32px]" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-[32px]">
            <FormField

              control={form.control}

              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="w-full h-[56px] bg-[#EBEBEB] hover:border-[#6B6E73] hover:border-[1px] focus:border-[#FF6B3D] focus:border-[1px] pt-[8px] pb-[24px] px-[8px] placeholder:text-[#292A2E] placeholder:text-[12px] placeholder:uppercase placeholder:absolute placeholder:top-2 placeholder:left-2"
                      placeholder="Email"
                      {...field}
                      // Disable input during form submission
                      disabled={isLoading}
                      // Enable browser autocomplete
                      autoComplete="email"
                    />
                  </FormControl>
                  {/* Display validation errors */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="w-full h-[56px] bg-[#EBEBEB] hover:border-[#6B6E73] hover:border-[1px] focus:border-[#FF6B3D] focus:border-[1px] pt-[8px] pb-[24px] px-[8px] placeholder:text-[#292A2E] placeholder:text-[12px] placeholder:uppercase placeholder:absolute placeholder:top-2 placeholder:left-2"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        disabled={isLoading}
                        autoComplete="current-password"
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
          </div>
          <Button className="w-full h-[56px] p-[8px] bg-[#FF6B3D] hover:bg-[#FE3F11] active:bg-[#EF2607] hover:border-[#FF6B3D] hover:border-[1px] text-[#fff] text-[16px] font-medium" type="submit" disabled={isLoading}>
            {isLoading && (
              // <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              <Loader className="mr-5 h-4 w-4 animate-spin" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="w-full text-center text-[14px] font-medium">
            <Button variant="link" className="text-[#FF6B3D] underline" asChild>
              <a href="/auth/forgot-password">Reset password?</a>
            </Button>
          </div>
        </form>
      </Form>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}