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

export function DiscountRuleSelector({ onSelectRule, customerTags = [], existingRuleIds = [] }) {
  const [open, setOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState(null)
  const [discountRules, setDiscountRules] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filteredRules, setFilteredRules] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchAllDiscountRules = async () => {
      setIsLoading(true);
      
      try {
        // Use a large limit to fetch all records in one go
        const response = await discountService.getDiscountRules({
          limit: 10000, // Using a reasonable limit
          filters: { 
            discount_type: 'CUSTOMER' 
          }
        }, { signal: abortController.signal });

        if (!isMounted) return;

        if (response.success) {
          setDiscountRules(response.data);
          setFilteredRules(response.data);
        } else {
          throw new Error('Failed to fetch discount rules');
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        
        console.error("Failed to fetch discount rules:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load discount rules",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Only fetch if the popover is open and we don't have data yet
    if (open && discountRules.length === 0) {
      fetchAllDiscountRules();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [open, toast]); // Only depend on open and toast

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = discountRules.filter(rule => 
      rule.name.toLowerCase().includes(searchTerm) || 
      (rule.description && rule.description.toLowerCase().includes(searchTerm))
    )
    setFilteredRules(filtered)
  }

  const handleSelectRule = (rule) => {
    console.log('Selected rule:', rule)
    
    // Check if rule is already assigned
    if (existingRuleIds.includes(rule.id)) {
      console.log('Rule already assigned:', rule.id, 'Existing IDs:', existingRuleIds)
      toast({
        title: "Already Assigned",
        description: "This discount rule is already assigned to the customer",
        variant: "default"
      })
      return
    }
    
    setSelectedRule(rule)
    if (onSelectRule) {
      onSelectRule(rule)
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
          {selectedRule ? (
            <span>{selectedRule.name}</span>
          ) : (
            <span>Assign Discount Rule</span>
          )}
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" side="right" align="start">
        <div className="border-b px-3 py-2">
          <input 
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground" 
            placeholder="Search discount rules..." 
            onChange={handleSearch}
          />
        </div>
        <div className="max-h-[300px] overflow-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No discount rules found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredRules.map((rule) => {
                const isAssigned = existingRuleIds.includes(rule.id);
                return (
                  <div 
                    key={rule.id} 
                    className={`px-2 py-1.5 rounded ${isAssigned ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'}`}
                    onClick={() => !isAssigned && handleSelectRule(rule)}
                  >
                    <div className="flex flex-col py-1 w-full">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-medium">{rule.name}</span>
                        {isAssigned && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            Assigned
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {rule.description}
                      </span>
                      {rule.amount ? (
                        <span className="text-xs font-medium text-green-600 mt-1">
                          Discount: ${rule.amount}
                        </span>
                      ) : rule.percentage ? (
                        <span className="text-xs font-medium text-green-600 mt-1">
                          Discount: {rule.percentage}%
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
