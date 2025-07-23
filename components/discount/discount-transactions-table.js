"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { discountTransactionService } from "@/services/discount-transaction.service"
import { discountService } from "@/services/discount.service"
import { Pagination } from "@/components/ui/pagination"

export function DiscountTransactionsTable({ transactions = [] }) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current_page: 1,
    per_page: 10
  })
  const [customers, setCustomers] = useState({})
  const [brands, setBrands] = useState({})
  const [branches, setBranches] = useState({})

  const fetchLookupData = async () => {
    try {
      const [customersRes, brandsRes, branchesRes] = await Promise.all([
        discountService.getCustomers(),
        discountService.getBrands(),
        discountService.getBranches()
      ])

      const customersMap = {}
      const brandsMap = {}
      const branchesMap = {}

      customersRes.data?.forEach(customer => {
        customersMap[customer._id] = customer
      })
      brandsRes.data?.forEach(brand => {
        brandsMap[brand._id] = brand
      })
      branchesRes.data?.forEach(branch => {
        branchesMap[branch._id] = branch
      })

      setCustomers(customersMap)
      setBrands(brandsMap)
      setBranches(branchesMap)
    } catch (error) {
      console.error('Failed to fetch lookup data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reference data"
      })
    }
  }

  useEffect(() => {
    fetchLookupData()
  }, [])

  const handleSearch = async (e, newPage = 1, newLimit = limit) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const formattedNumber = searchQuery.trim().startsWith('+') 
        ? searchQuery.trim() 
        : `+${searchQuery.trim()}`
        
      const result = await discountTransactionService.searchTransactionsByMobile(
        formattedNumber,
        newPage,
        newLimit
      )
      
      if (result.data?.transactions && result.data.transactions.length > 0) {
        setSearchResults(result.data)
        setPagination(result.pagination)
        toast({
          title: "Search Results",
          description: `Found ${result.data.summary.total_transactions} transaction(s) with total amount $${result.data.summary.total_amount}`,
        })
      } else {
        setSearchResults(null)
        setPagination({
          total: 0,
          pages: 1,
          current_page: 1,
          per_page: newLimit
        })
        toast({
          title: "No Results",
          description: "No transactions found with this mobile number",
        })
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to search transactions',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    if (searchResults) {
      handleSearch(null, newPage, limit)
    }
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setPage(1)
    if (searchResults) {
      handleSearch(null, 1, newLimit)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults(null)
    setPage(1)
    setPagination({
      total: 0,
      pages: 1,
      current_page: 1,
      per_page: limit
    })
  }

  const displayTransactions = searchResults?.transactions || transactions
  
  const getDiscountCode = (transaction) => {
    if (!transaction.discount_code) return '-'
    
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
      >
        {transaction.discount_name || 'Unknown Code'}
      </span>
    )
  }

  const getCustomerName = (customerId) => {
    if (!customerId) return '-'
    const customer = customers[customerId]
    
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
      >
        {customer ? `${customer.first_name} ${customer.last_name}` : 'Loading...'}
      </span>
    )
  }

  const getBrandName = (brandId) => {
    if (!brandId) return '-'
    const brand = brands[brandId]
    
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      >
        {brand ? brand.brand_name : 'Loading...'}
      </span>
    )
  }

  const getBranchName = (branchId) => {
    if (!branchId) return '-'
    const branch = branches[branchId]
    
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        {branch ? branch.branch_name : 'Loading...'}
      </span>
    )
  }

  const getTransactionDetails = (transaction) => {
    if (!transaction.transaction_details?.length) return '-'
    
    return (
      <div className="space-y-1">
        {transaction.transaction_details.map((item, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium">{item.item_name}</div>
            <div className="text-gray-500">
              Qty: {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.total_amount.toFixed(2)}
            </div>
            <div className="text-green-600">
              Discount: ${item.discount_applied.toFixed(2)}
            </div>
            <div className="font-medium">
              Final: ${item.final_amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {searchResults ? 'Search Results' : 'Transaction History'}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by mobile number... (e.g., +6591234567)"
                value={searchQuery}
                onChange={(e) => {
                  // Allow only numbers and + symbol
                  const value = e.target.value.replace(/[^\d+]/g, '')
                  setSearchQuery(value)
                }}
                className="w-[300px]"
                disabled={isSearching}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-1/2 -translate-y-1/2 h-full aspect-square p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" size="sm" disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin">
                  <Search className="h-4 w-4" />
                </div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Discount Type</TableHead>
                <TableHead>Discount Code</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Transaction Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                displayTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.discount_transaction_id}</TableCell>
                    <TableCell>
                      {format(new Date(transaction.create_date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{getCustomerName(transaction.customer_id)}</TableCell>
                    <TableCell>{transaction.mobile_num}</TableCell>
                    <TableCell>{transaction.discount_type}</TableCell>
                    <TableCell>{getDiscountCode(transaction)}</TableCell>
                    <TableCell>${transaction.discount_amount.toFixed(2)}</TableCell>
                    <TableCell>{getBrandName(transaction.brand)}</TableCell>
                    <TableCell>{getBranchName(transaction.branch)}</TableCell>
                    <TableCell>{getTransactionDetails(transaction)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {searchResults && (
          <div className="border-t p-4">
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 