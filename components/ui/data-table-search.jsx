"use client"

import { useState, useEffect, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DataTableSearch({ 
  data = [], 
  searchFields = [],
  onSearchResults,
  placeholder = "Search...",
  className = "",
  debounceMs = 300, // Debounce delay in milliseconds
  searchRef // Reference for external control
}) {
  const [searchQuery, setSearchQuery] = useState('')

  // Expose methods and state through the ref
  useEffect(() => {
    if (searchRef) {
      searchRef.current = {
        clear: () => {
          setSearchQuery('')
          onSearchResults(data)
        },
        getQuery: () => searchQuery
      }
    }
  }, [searchRef, data, onSearchResults, searchQuery])

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      const filteredData = filterData(data, searchQuery, searchFields)
      onSearchResults(filteredData)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, data, searchFields, onSearchResults, debounceMs])

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearch}
        className="pl-8"
      />
    </div>
  )
}

// Helper function to filter data based on search query and fields
function filterData(data, query, searchFields) {
  if (!query) return data

  return data.filter(item => {
    return searchFields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item)
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(query.toLowerCase())
    })
  })
} 