"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft  } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="secondary"
      onClick={() => router.back()}
      className="p-5"
    >
      <ChevronLeft />
      Back
    </Button>
  )
} 