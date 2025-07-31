import useGetExtraHours from '@/hooks/useGetExtraHours'
import React, { useEffect } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function AdditionalHoursSelect({ value, onChange ,branchId,userType}) {
    const {extraHoursList,extraHoursListRefresh,extraHoursListLoading}=useGetExtraHours()
  
  useEffect(()=>{
    extraHoursListRefresh({branch_id:branchId,play_customer_type_id:userType})
  },[branchId,userType])
 
    return (
        <div style={{ width: "250px", maxWidth: "250px" }}>
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
                {`min ${extraHour.duration} price ${extraHour.price}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* {error && <p className="text-red-500 text-xs mt-1">{error}</p>} */}
      </div>
  )
}
