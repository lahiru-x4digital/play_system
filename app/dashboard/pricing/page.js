"use client"
import useGetTimeDurationPricing from '@/hooks/useGetTimeDurationPricing'
import React from 'react'
import PricingTable from '@/components/pricing/pricing-table'
import { Pagination } from '@/components/ui/pagination'

export default function PricingPage() {
    const {
      timeDurationPricing,
      timeDurationPricingLoading,
      timeDurationPricingLimit,
      currentPage,
      timeDurationPricingTotalPages,
      timeDurationPricingTotalCount,
      timeDurationPricingPageNavigation,
      timeDurationPricingChangePageSize
    } = useGetTimeDurationPricing(null)

    return (
      <div>
        <PricingTable data={timeDurationPricing} />
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
