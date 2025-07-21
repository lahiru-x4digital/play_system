"use client"
import React from 'react'
import { GeneratorDialog } from '@/components/bar-code-generator/GeneratorDialog'
import BarcodeTable from '@/components/bar-code-generator/barcode-table'
import useGetBarCodes from '@/hooks/useGetBarCodes'
import { Pagination } from '@/components/ui/pagination'
export default function BarCodeGenerator() {

  const {barcodeList,barcodeListLoading,barcodeListLimit,currentPage,totalPages,barcodeListTotalCount,barcodeListPageNavigation,barcodeListChangePageSize,barcodeListRefres}=useGetBarCodes()

  return (
    <div>
     
      <GeneratorDialog barcodeListRefres={barcodeListRefres} />
      <BarcodeTable data={barcodeList} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={barcodeListPageNavigation}
        pageSize={barcodeListLimit}
        onPageSizeChange={barcodeListChangePageSize}
        total={barcodeListTotalCount}
      />
   
    </div>
  )
}