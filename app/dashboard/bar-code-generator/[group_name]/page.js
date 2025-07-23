"use client"
import BarcodeNumberTable from '@/components/bar-code-generator/barcode-number-table'
import useGetBarCodes from '@/hooks/useGetBarCodes'
import { useParams } from 'next/navigation'
import React from 'react'
export default function BarcodeList() {
  //get param 
  const params = useParams()
  const groupName = params.group_name
  const {barcodeList,barcodeListLoading,barcodeListLimit,currentPage,totalPages,barcodeListTotalCount,barcodeListPageNavigation,barcodeListChangePageSize,barcodeListRefres}=useGetBarCodes(groupName)

  return (
    <div>
      <BarcodeNumberTable data={barcodeList} />
    </div>
  )
}