"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const TimePickerInput = React.forwardRef(({ 
  className, 
  value, 
  onChange,
  max,
  min,
  ...props 
}, ref) => {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className={cn(
        "w-[48px] text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
TimePickerInput.displayName = "TimePickerInput"

export { TimePickerInput }