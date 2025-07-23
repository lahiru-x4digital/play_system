"use client"
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link'
import { Eye } from 'lucide-react'

const BarcodeTable = ({ data = [] }) => {
 
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead>Duration (Min)</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Action</TableHead>
            
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No barcodes found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.group_name || '-'}</TableCell>
                <TableCell>{item.duration || '-'}</TableCell>
                <TableCell>{item.qty || '-'}</TableCell>
                <TableCell className="font-mono">{item.type || '-'}</TableCell>
                <TableCell className="font-mono"><Link href={`/dashboard/bar-code-generator/${item.group_name}`}>
                <Eye />
                </Link></TableCell>
          
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default BarcodeTable
