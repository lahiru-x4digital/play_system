"use client"
import React from 'react'
import { GeneratorDialog } from '@/components/bar-code-generator/GeneratorDialog'
import BarcodeTable from '@/components/bar-code-generator/barcode-table'
import useGetBarCodes from '@/hooks/useGetBarCodes'
export default function BarCodeGenerator() {

  const {barcodeList,barcodeListLoading,barcodeListError,barcodeListTotalCount,barcodeListPageNavigation,barcodeListSearch,barcodeListRefres,barcodeListChangePageSize}=useGetBarCodes()
  return (
    <div>
     
      <GeneratorDialog />
      <BarcodeTable data={barcodeList} />
   
    </div>
  )
}