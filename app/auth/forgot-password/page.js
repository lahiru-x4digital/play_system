import { PasswordResetRequestForm } from "@/components/password-reset-request-form"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
export default function ForgotPasswordPage() {
  return (
    <div className="w-screen h-screen flex min-h-svh flex-col items-center justify-center bg-background bg-[url('/bg-login.png')] bg-cover bg-center">
      <div className="absolute top-0 left-0 w-full h-screen bg-[#000] opacity-50" />
      <div className="w-screen h-screen flex items-center justify-evenly px-[72px] py-[32px] gap-[32px] z-10">
        <Image src="/re_logo.png" alt="logo" width={461} height={144} />
        <Card>
          <CardContent>
            <PasswordResetRequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 