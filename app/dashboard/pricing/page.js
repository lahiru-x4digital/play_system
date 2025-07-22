"use client"
import useGetTimeDurationPricing from '@/hooks/useGetTimeDurationPricing'
import React, { useState } from 'react'
import PricingTable from '@/components/pricing/pricing-table'
import { Pagination } from '@/components/ui/pagination'
import CreatePricingDialog from '@/components/pricing/CreatePricingDialog';
import useGetTimeDurationPricingInitial from '@/hooks/useGetTimeDurationPricingInitial'

export default function PricingPage() {
    const {
      timeDurationPricing,
      timeDurationPricingLoading,
      timeDurationPricingLimit,
      currentPage,
      timeDurationPricingTotalPages,
      timeDurationPricingTotalCount,
      timeDurationPricingPageNavigation,
      timeDurationPricingChangePageSize,
      timeDurationPricingRefres
    } = useGetTimeDurationPricingInitial(null)

    return (
      <div>
        <div className="flex justify-end mb-4">
          <CreatePricingDialog onSuccess={timeDurationPricingRefres} />
        </div>
        <PricingTable data={timeDurationPricing} onRefresh={timeDurationPricingRefres} />
        <Pagination
          currentPage={currentPage}
          totalPages={timeDurationPricingTotalPages}
          onPageChange={timeDurationPricingPageNavigation}
          pageSize={timeDurationPricingLimit}
          onPageSizeChange={timeDurationPricingChangePageSize}
          total={timeDurationPricingTotalCount}
        />
      </div>
    )
}
