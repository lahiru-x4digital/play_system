"use client"
import useGetTimeDurationPricing from '@/hooks/useGetTimeDurationPricing'
import React from 'react'

export default function page() {
    const {timeDurationPricing,timeDurationPricingLoading}=useGetTimeDurationPricing(null)
    console.log(timeDurationPricing)
  return (
    <div>page</div>
  )
}
