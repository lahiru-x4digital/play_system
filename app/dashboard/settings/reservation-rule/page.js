"use client"
import { AddRuleForm } from '@/components/settings/reservation-rule/reservation-rule-form'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

export default function page() {
    const [open, setOpen] = useState(false)
  return (
    <div>
        <Button
            onClick={() => setOpen(true)}
           
            className='px-4 py-2 rounded-md hover:cursor-pointer'
        >
            Add Reservation Rule
        </Button>
     <AddRuleForm
            open={open}
            onOpenChange={setOpen}
            onSuccess={()=>{}}
            branchId={1}
          />
    </div>
  )
}
