"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Check, ChevronsUpDown, Loader2, Search, SearchCheck, SearchCheckIcon, SearchIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function SearchableSelect({
  options = [],
  isLoading = false,
  placeholder = "Search...",
  emptyText = "No results found.",
  searchKeys = ["brand_name", "brand_id"],
  displayFormat = (option) => `${option.brand_name} (${option.brand_id})`,
  valueKey = "id",
  disabled = false,
  multiple = true,
  selectedValues = [],
  onValueChange,
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options
    
    const lowercaseQuery = searchQuery.toLowerCase()
    return options.filter((option) =>
      searchKeys.some((key) => {
        const value = option[key]?.toString().toLowerCase()
        return value?.includes(lowercaseQuery)
      })
    )
  }, [options, searchQuery, searchKeys])

  // Handle selection
  const handleSelect = useCallback((currentValue) => {
    console.log('Handling select:', currentValue)
    onValueChange?.(currentValue)
    if (!multiple) {
      setOpen(false)
    }
    setSearchQuery("")
  }, [multiple, onValueChange])

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              type="text"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setOpen(true)}
              className={cn(
                "w-full pr-8",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
              ) : (
                <ChevronsUpDown 
                  className="h-4 w-4 shrink-0 opacity-50 cursor-pointer" 
                  onClick={() => setOpen(!open)}
                />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-auto">
                {filteredOptions.map((option) => {
                  const optionValue = option[valueKey].toString()
                  const isSelected = selectedValues.includes(optionValue)
                  
                  return (
                    <CommandItem
                      key={optionValue}
                      value={optionValue}
                      onSelect={handleSelect}
                      className={cn(
                        "flex items-center justify-between cursor-pointer",
                        isSelected && "bg-accent"
                      )}
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>{displayFormat(option)}</span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 