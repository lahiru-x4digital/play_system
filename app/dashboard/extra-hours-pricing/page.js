"use client";
import SelectBranch from '@/components/common/selectBranch';
import useGetExtraHours from '@/hooks/useGetExtraHours'
import React, { useEffect, useState } from 'react'
import ExtraHoursPricingTable from '@/components/extra-hours-pricing/Extra-pricing-table';
import CreateExtraPricingDialog from '@/components/extra-hours-pricing/CreateExtraPricingDialog';
import useSessionUser from '@/lib/getuserData';
export default function page() {
    const user=useSessionUser()
    const {extraHoursList,extraHoursListLoading,extraHoursListRefresh}= useGetExtraHours()
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId);
   const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    extraHoursListRefresh({branch_id:branchId});
   }
   useEffect(() => {
    if (selectedBranch) {
      extraHoursListRefresh({ branch_id: selectedBranch });
    } 
  }, [selectedBranch]);
  return (
    <div>
       <div className="flex items-end gap-4 my-2">
        <SelectBranch value={selectedBranch} onChange={handleBranchChange} />
        <CreateExtraPricingDialog onSuccess={()=>{
            extraHoursListRefresh({branch_id:selectedBranch})
          }} /> 
        </div>
        <ExtraHoursPricingTable data={extraHoursList} onRefresh={()=>{
          extraHoursListRefresh({branch_id:selectedBranch})
        }} />
    </div>
  )
}
