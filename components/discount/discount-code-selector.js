"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { discountService } from "@/services/discount.service"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export function DiscountCodeSelector({ onSelectCode, existingCodeIds = [] }) {
  const [open, setOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState(null)
  const [discountCodes, setDiscountCodes] = useState([])
  const [filteredCodes, setFilteredCodes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDiscountCodes = async () => {
      setIsLoading(true)
      try {
        const response = await discountService.getDiscountCodes({})
        if (response.success) {
          console.log('Fetched discount codes:', response.data)
          setDiscountCodes(response.data)
          setFilteredCodes(response.data)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load discount codes",
          })
        }
      } catch (error) {
        console.error("Failed to fetch discount codes:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load discount codes",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscountCodes()
  }, [toast])

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = discountCodes.filter(code => 
      code.name.toLowerCase().includes(searchTerm) || 
      code.code.toLowerCase().includes(searchTerm) ||
      (code.description && code.description.toLowerCase().includes(searchTerm))
    )
    setFilteredCodes(filtered)
  }

  const handleSelectCode = (code) => {
    console.log('Selected code:', code)
    
    // Check if code is already assigned
    if (existingCodeIds.includes(code.id)) {
      console.log('Code already assigned:', code.id, 'Existing IDs:', existingCodeIds)
      toast({
        title: "Already Assigned",
        description: "This discount code is already assigned to the customer",
        variant: "default"
      })
      return
    }
    
    setSelectedCode(code)
    if (onSelectCode) {
      onSelectCode(code)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          <span>Assign Discount Code</span>
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" side="right" align="start">
        <div className="border-b px-3 py-2">
          <input 
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground" 
            placeholder="Search discount codes..." 
            onChange={handleSearch}
          />
        </div>
        <div className="max-h-[300px] overflow-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No discount codes found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCodes.map((code) => {
                const isAssigned = existingCodeIds.includes(code.id);
                return (
                  <div 
                    key={code.id} 
                    className={`px-2 py-1.5 rounded ${isAssigned ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'}`}
                    onClick={() => !isAssigned && handleSelectCode(code)}
                  >
                    <div className="flex flex-col py-1 w-full">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-medium">{code.name}</span>
                        {isAssigned && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            Assigned
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Code: {code.code}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {code.description}
                      </span>
                      {code.amount ? (
                        <span className="text-xs font-medium text-green-600 mt-1">
                          Discount: ${code.amount}
                        </span>
                      ) : code.percentage ? (
                        <span className="text-xs font-medium text-green-600 mt-1">
                          Discount: {code.percentage}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
