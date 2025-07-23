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

export function MenuItemDiscountSelector({ onSelectDiscount, existingDiscountIds = [] }) {
  const [open, setOpen] = useState(false)
  const [selectedMenuItemDiscount, setSelectedMenuItemDiscount] = useState(null)
  const [menuItemDiscounts, setMenuItemDiscounts] = useState([])
  const [filteredMenuItemDiscounts, setFilteredMenuItemDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchMenuItemDiscounts = async () => {
      setIsLoading(true);
      
      try {
        const response = await discountService.getMenuItemDiscounts({ 
          limit: 10000, // Use a large limit to fetch all records in one go
          filters: { 
            is_active: true // Only fetch active discounts by default
          }
        });

        if (!isMounted) return;
        
        if (response.success) {
          console.log('Fetched menu item discounts:', response.data);
          setMenuItemDiscounts(response.data);
          setFilteredMenuItemDiscounts(response.data);
        } else {
          throw new Error('Failed to fetch menu item discounts');
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        
        console.error("Failed to fetch menu item discounts:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load menu item discounts",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Only fetch if the popover is open and we don't have data yet
    if (open && menuItemDiscounts.length === 0) {
      fetchMenuItemDiscounts();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [open, toast]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = menuItemDiscounts.filter(discount => 
        discount.discount_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        discount.discount_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discount.description && discount.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMenuItemDiscounts(filtered)
    } else {
      setFilteredMenuItemDiscounts(menuItemDiscounts)
    }
  }, [searchTerm, menuItemDiscounts])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSelectDiscount = (discount) => {
    console.log('Selected discount:', discount)
    if (existingDiscountIds.includes(discount.id)) {
      toast({
        title: "Already Assigned",
        description: "This discount is already assigned to the customer",
        variant: "default"
      })
      return
    }
    
    setSelectedMenuItemDiscount(discount)
    if (onSelectDiscount) {
      onSelectDiscount(discount)
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
          <span>Assign Menu Item Discount</span>
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[350px]" side="right" align="start">
        <div className="border-b px-3 py-2">
          <input 
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground" 
            placeholder="Search menu item discounts..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="max-h-[400px] overflow-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredMenuItemDiscounts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchTerm ? "No matching discounts found" : "No menu item discounts available"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMenuItemDiscounts.map((discount) => {
                const isAssigned = existingDiscountIds.includes(discount.id)
                return (
                  <div 
                    key={discount.id} 
                    className={`px-2 py-1.5 rounded ${isAssigned ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'}`}
                    onClick={() => !isAssigned && handleSelectDiscount(discount)}
                  >
                    <div className="flex flex-col py-1 w-full">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-medium">{discount.discount_name}</span>
                        {isAssigned && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            Assigned
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Code: {discount.discount_id}
                        </span>
                        <span className="text-xs font-medium ml-2">Discount: 
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%` 
                            : `$${discount.discount_value}`}
                        </span>
                      </div>
                      {discount.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {discount.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {discount.days?.length > 0 && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {discount.days.length} days
                          </span>
                        )}
                        {discount.min_order_value > 0 && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            Min: ${discount.min_order_value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}