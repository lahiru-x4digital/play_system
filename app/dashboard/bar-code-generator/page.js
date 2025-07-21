import React from 'react'
import { GeneratorDialog } from '@/components/bar-code-generator/GeneratorDialog'
import BarcodeTable from '@/components/bar-code-generator/barcode-table'
export default function BarCodeGenerator() {
  return (
    <div>
     
      <GeneratorDialog />
      <BarcodeTable />
    </div>
  )
}