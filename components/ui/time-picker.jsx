"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { TimePickerInput } from "./time-picker-input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export function TimePickerDemo({
  date,
  setDate,
}) {
  const minuteRef = React.useRef(null)
  const hourRef = React.useRef(null)
  const [hour, setHour] = React.useState(date ? date.getHours() % 12 || 12 : 12)
  const [minute, setMinute] = React.useState(date ? date.getMinutes() : 0)
  const [isPM, setIsPM] = React.useState(date ? date.getHours() >= 12 : false)

  React.useEffect(() => {
    if (date) {
      const hours = date.getHours()
      setHour(hours % 12 || 12)
      setMinute(date.getMinutes())
      setIsPM(hours >= 12)
    }
  }, [date])

  const handleHourChange = (e) => {
    const newHour = parseInt(e.target.value, 10)
    if (isNaN(newHour)) return
    
    setHour(newHour)
    const hours = isPM && newHour !== 12 ? newHour + 12 : newHour
    const newDate = new Date(date || new Date())
    newDate.setHours(hours)
    newDate.setMinutes(minute)
    setDate(newDate)
  }

  const handleMinuteChange = (e) => {
    const newMinute = parseInt(e.target.value, 10)
    if (isNaN(newMinute)) return
    
    setMinute(newMinute)
    const hours = isPM && hour !== 12 ? hour + 12 : hour
    const newDate = new Date(date || new Date())
    newDate.setHours(hours)
    newDate.setMinutes(newMinute)
    setDate(newDate)
  }

  const handleAMPMToggle = () => {
    const newIsPM = !isPM
    setIsPM(newIsPM)
    
    let newHour = hour
    if (newIsPM && newHour !== 12) {
      newHour += 12
    } else if (!newIsPM && newHour > 12) {
      newHour -= 12
    }
    
    const newDate = new Date(date || new Date())
    newDate.setHours(newHour)
    newDate.setMinutes(minute)
    setDate(newDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "hh:mm a")
          ) : (
            <span>Pick a time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-end gap-2 p-3">
          <div className="grid gap-1 text-center">
            <Label htmlFor="hours" className="text-xs">Hours</Label>
            <TimePickerInput
              ref={hourRef}
              value={hour}
              onChange={handleHourChange}
              min={1}
              max={12}
            />
          </div>
          <div className="grid gap-1 text-center">
            <Label htmlFor="minutes" className="text-xs">Minutes</Label>
            <TimePickerInput
              ref={minuteRef}
              value={minute}
              onChange={handleMinuteChange}
              min={0}
              max={59}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "px-3",
                !isPM && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleAMPMToggle()}
            >
              AM
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "px-3",
                isPM && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleAMPMToggle()}
            >
              PM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 