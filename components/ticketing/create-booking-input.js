import React, { useEffect, useState } from 'react'
import SelectBranch from '../common/selectBranch'
import { Controller, useFormContext } from 'react-hook-form'
import { bookingService } from '@/services/booking.service'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { format } from 'date-fns'
import { motion } from "framer-motion";
import GenerateTimeSlots, { TimeSlotSelector } from './GenerateTimeSlots'

export default function CreateBookingInput() {
    const { control, watch } = useFormContext()
    const [rules, setRules] = useState([])
    const [loading, setLoading] = useState(false)
    
    const branchId = watch("branch_id")
    const selectedDate = watch("date")
console.log(branchId)
    useEffect(() => {
        const fetchRules = async () => {
      
            setLoading(true)
            try {
                const { success, data } = await bookingService.getReservationRules({
                    branch_id: branchId,
                    date: selectedDate
                })
                if (success) {
                    setRules(data)
                }
            } catch (error) {
                console.error("Failed to fetch reservation rules:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRules()

    }, [branchId, selectedDate])

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Create Booking</h1>
            
            <div className="">
                <Controller
                    name="branch_id"
                    control={control}
                    rules={{ required: "Branch is required" }}
                    render={({ field, fieldState }) => (
                        <SelectBranch
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            label="Branch"
                        />
                    )}
                />
        
                <Controller
                    name="date"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field, fieldState }) => (
                        <div >
                            <label className="block text-sm font-medium mb-1">
                                Date
                            </label>
                            <input 
                                type="date" 
                                className='border rounded px-3 py-2 w-full'
                                {...field}
                            />
                            {fieldState.error && (
                                <p className="text-red-500 text-sm mt-1">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                    defaultValue={new Date().toISOString().split("T")[0]}
                />
            </div>

            {loading ? (
  <div className="flex items-center justify-center py-10">
    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
    <span className="text-muted-foreground">Loading availability rules...</span>
  </div>
) : (
  <div className="">
   <div className='flex flex-row gap-4'>
   {rules.map((rule, i) => (
      <motion.div
      className='min-w-96'
        key={rule.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {rule.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {rule.slot_booking_period} mins
                  </span>
                </div>

                {rule.price && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="inline-block px-2 py-0.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
                      {rule.price}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    ))}
   </div>
{rules?.length > 0 && (
  <div className="mt-8">
    <TimeSlotSelector
     rule={rules[0]}
     selectedDate={selectedDate}
     
    />
  </div>
)}
    </div>
)}
        </div>
    )
}