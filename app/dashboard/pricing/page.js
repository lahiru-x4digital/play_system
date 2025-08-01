"use client"
import React, { useEffect, useState } from 'react'
import PricingTable from '@/components/pricing/pricing-table'
import { Pagination } from '@/components/ui/pagination'
import CreatePricingDialog from '@/components/pricing/CreatePricingDialog';
import useGetTimeDurationPricingInitial from '@/hooks/useGetTimeDurationPricingInitial'
import useSessionUser from '@/lib/getuserData'
import SelectBranch from '@/components/common/selectBranch';


export default function PricingPage() {
  const user=useSessionUser()
  
    const {
      timeDurationPricing,
      timeDurationPricingLoading,
      timeDurationPricingLimit,
      currentPage,
      timeDurationPricingTotalPages,
      timeDurationPricingTotalCount,
      timeDurationPricingPageNavigation,
      timeDurationPricingChangePageSize,
      timeDurationPricingSearch,
    } = useGetTimeDurationPricingInitial(null)

    const [selectedBranch, setSelectedBranch] = useState(user?.branchId);
    useEffect(()=>{
        if(selectedBranch){
          timeDurationPricingSearch({branch_id:selectedBranch})
        }
    },[selectedBranch])
    return (
      <div>
      <div className="flex items-end gap-4 my-2">
        <SelectBranch value={selectedBranch} onChange={(branchId)=>setSelectedBranch(branchId)}/>
        <CreatePricingDialog onSuccess={()=>timeDurationPricingSearch({branch_id:selectedBranch})} />

        </div>
        <PricingTable data={timeDurationPricing} onRefresh={()=>timeDurationPricingSearch({branch_id:selectedBranch})} />
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
