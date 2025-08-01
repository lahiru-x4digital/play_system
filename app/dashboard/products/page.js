"use client";
import React, { useEffect, useState } from 'react'
import SelectBranch from '@/components/common/selectBranch'
import useGetProducts from '@/hooks/useGetProducts'
import { useSession } from 'next-auth/react'
import useSessionUser from '@/lib/getuserData';
import ProductTable from '@/components/product/product-table';
import CreateProductDialog from '@/components/product/CreateProductDialog';
export default function page() {
    const user=useSessionUser()
  
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId);
    const {productsList,productsListLoading,productsListRefresh}= useGetProducts()
    useEffect(()=>{
        if(selectedBranch){
            productsListRefresh({branch_id:selectedBranch})
        } 
    },[selectedBranch])
  return (
    <div>
        <div className="flex items-end gap-4 my-2">
        <SelectBranch value={selectedBranch} onChange={(branchId)=>setSelectedBranch(branchId)}/>
        <CreateProductDialog onSuccess={()=>productsListRefresh({branch_id:selectedBranch})} />
        
        </div>
        <ProductTable data={productsList} onRefresh={()=>productsListRefresh({branch_id:selectedBranch})}/>
    </div>
  )
}
