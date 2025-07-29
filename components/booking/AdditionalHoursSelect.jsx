import useGetExtraHours from '@/hooks/useGetExtraHours'
import React, { useEffect } from 'react'

export default function AdditionalHoursSelect({ value, onChange ,branchId,userType}) {
    const {extraHoursList,extraHoursListRefresh,extraHoursListLoading}=useGetExtraHours()
  
  useEffect(()=>{
    extraHoursListRefresh({branch_id:branchId,play_customer_type_id:userType})
  },[branchId,userType])
  console.log(extraHoursList)
    return (
    <div>
        <div style={{ width: "100%", maxWidth: "400px" }}>
        <Label>Additional Hours</Label>
        <Select
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(val) => onChange(Number(val))}
          disabled={extraHoursListLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Additional Hours" />
          </SelectTrigger>
          <SelectContent>
            {extraHoursList.map((extraHour) => (
              <SelectItem key={extraHour.id} value={String(extraHour.id)}>
                {extraHour.duration || extraHour.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  )
}
