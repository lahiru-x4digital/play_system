import useGetExtraHours from '@/hooks/useGetExtraHours'
import React, { useEffect } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function AdditionalHoursSelect({ value, onChange, branchId, userType }) {
    const { extraHoursList, extraHoursListRefresh, extraHoursListLoading } = useGetExtraHours()
  
    useEffect(() => {
        extraHoursListRefresh({ branch_id: branchId, play_customer_type_id: userType })
    }, [branchId, userType])

    const handleValueChange = (val) => {
        const selectedItem = extraHoursList.find(item => String(item.id) === val);
        if (selectedItem) {
            onChange({
                id: selectedItem.id,
                price: selectedItem.price,
                duration: selectedItem.duration
            });
        }
    };

    return (
        <div style={{ width: "250px", maxWidth: "250px" }}>
            <Label className='text-sm font-medium text-gray-900'>Additional Hours</Label>
            <Select
                value={value?.id !== undefined ? String(value.id) : ""}
                onValueChange={handleValueChange}
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
        </div>
    )
}
