"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Loader } from "lucide-react"
import { userService } from "@/services/user.service"
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export function PasswordResetRequestForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values) {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await userService.requestPasswordReset(values.email)
      setSuccess("We've sent a password reset link to your email. Please check your inbox.")
      form.reset()
    } catch (error) {
      console.log(error.message)
      setError("Unable to send reset link. Make sure the email is correct.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-[521px] flex flex-col justify-center items-center px-[32px] py-[48px] gap-[32px]">
      <div className="flex flex-col items-center justify-center leading-[22px] gap-[16px]">
        <h1 className="text-[30px] font-semibold">Reset Password</h1>
        <p className="text-[14px] text-[#6B6E73] text-center">
          Enter the email address linked to your account and we'll send you a link to reset your password.
        </p>
      </div>

      <Form {...form}>
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
                      disabled={isLoading}
                      autoComplete="email"
                    />
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
            {isLoading && (
              <Loader className="mr-5 h-4 w-4 animate-spin" />
            )}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="w-full text-center text-[14px] font-medium">
            <Button variant="link" className="text-[#6B6E73] underline" asChild>
              <a href="/auth">Back to Login</a>
            </Button>
          </div>
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
            {success}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 