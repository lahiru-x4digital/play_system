"use client"

import { useState, useEffect, useMemo } from "react"
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
import { UserPlus, Pencil, Trash2, Search, X, ArrowUpDown, ArrowUp, ArrowDown, Check, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { EditCustomerForm } from "./edit-customer-form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { customerService } from "@/services/customer.service"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { sortData, createSortFields, defaultComparators } from "@/lib/table-sort"
import { AddCustomerForm } from "./add-customer-form"
import { useRouter } from "next/navigation"

export function CustomersTable({
  customers = [],
  customerTypes = [],
  selectedCustomerType,
  onCustomerTypeChange,
  onAddClick,
  onRefresh,
  sortConfig: initialSortConfig,
  onSortFieldChange,
  onSortDirectionChange
}) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [localCustomers, setLocalCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [localSortConfig, setLocalSortConfig] = useState({
    field: initialSortConfig?.field || 'created_date',
    direction: initialSortConfig?.direction || 'desc'
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()

  // Define sort options array
  const sortOptions = [
    { label: 'Customer ID', value: 'customer_id' },
    { label: 'Name', value: 'name' },
    { label: 'Phone', value: 'mobile_number' },
    { label: 'Joined Date', value: 'created_date' }
  ]

  // Create sort fields configuration
  const sortFields = createSortFields([
    {
      label: 'Customer ID',
      value: 'customer_id',
      type: 'customerId'
    },
    {
      label: 'Name',
      value: 'name',
      comparator: (_, __, a, b) => defaultComparators.name(a, b)
    },
    {
      label: 'Phone',
      value: 'mobile_number',
      type: 'phone'
    },
    {
      label: 'Joined Date',
      value: 'created_date',
      type: 'date'
    }
  ])

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update localCustomers when customers prop changes - with optimization
  useEffect(() => {
    if (mounted && JSON.stringify(customers) !== JSON.stringify(localCustomers)) {
      setLocalCustomers(customers)
    }
  }, [customers, mounted, localCustomers])

  const displayCustomers = useMemo(() => {
    if (!mounted) return []
    return searchResults?.customers || localCustomers || []
  }, [searchResults?.customers, localCustomers, mounted])

  const sortedCustomers = useMemo(() => {
    if (!mounted) return []
    return sortData(displayCustomers, localSortConfig, sortFields)
  }, [displayCustomers, localSortConfig.field, localSortConfig.direction, sortFields, mounted])

  const handleSelectAll = (checked) => {
    if (checked) {
      // Use id instead of _id and ensure we only select valid IDs
      setSelectedCustomers(sortedCustomers
        .filter(customer => customer?.id)
        .map(customer => customer.id))
    } else {
      setSelectedCustomers([])
    }
  }

  const handleSelectOne = (checked, customerId) => {
    if (!customerId) return // Guard against invalid IDs

    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId])
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId))
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      setShowDeleteDialog(false)

      if (selectedCustomers.length === 1) {
        await customerService.deleteCustomer(selectedCustomers[0])
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        })
      } else {
        await customerService.deleteCustomers(selectedCustomers)
        toast({
          title: "Success",
          description: `${selectedCustomers.length} customers deleted successfully`,
        })
      }

      setSelectedCustomers([])
      await onRefresh?.()
    } catch (error) {
      console.error('Failed to delete customers:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to delete customers',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = async () => {
    setSelectedCustomer(null)
    await onRefresh?.()
  }

  const handleSearch = async (e, newPage = 1, newLimit = 10) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)

      const result = await customerService.searchCustomerByMobile(searchQuery)

      if (result.success && result.data?.customers) {
        setSearchResults(result.data)
        setSelectedCustomers([])
        toast({
          title: "Search Results",
          description: `Found ${result.data.customers.length} customer(s)`,
        })
      } else {
        setSearchResults(null)
        toast({
          title: "No Results",
          description: "No customers found with this mobile number",
        })
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to search customers',
      })
    } finally {
      setIsSearching(false)
    }
  }


  const handleSortFieldChange = (field) => {
    setLocalSortConfig(current => ({
      ...current,
      field
    }))
    onSortFieldChange?.(field)
  }

  const handleSortDirectionChange = (direction) => {
    setLocalSortConfig(current => ({
      ...current,
      direction
    }))
    onSortDirectionChange?.(direction)
  }

  const handleAddClick = () => {
    setShowAddForm(true)
  }

  const handleAddSuccess = async () => {
    setShowAddForm(false)
    await onRefresh?.()
  }

  const handleViewDetails = (customerId) => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  // Don't render anything until after hydration
  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CardTitle>
            {searchResults ? 'Search Results' : 'Customer Details'}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort by
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Sort By Field</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortFieldChange(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {localSortConfig.field === option.value && (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort Direction</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleSortDirectionChange('asc')}
                className="flex items-center justify-between"
              >
                Ascending
                {localSortConfig.direction === 'asc' && (
                  <ArrowUp className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortDirectionChange('desc')}
                className="flex items-center justify-between"
              >
                Descending
                {localSortConfig.direction === 'desc' && (
                  <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedCustomerType
                  ? selectedCustomerType
                  : 'All Customer Types'
                }
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Customer Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onCustomerTypeChange?.(null)}
                className="flex items-center justify-between"
              >
                All Customer Types
                {selectedCustomerType === null && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {customerTypes.map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => onCustomerTypeChange?.(type.type)}
                  className="flex items-center justify-between"
                >
                  {type.type}
                  {selectedCustomerType === type.type && (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by mobile number... (e.g., 11111111111)"
                value={searchQuery}
                onChange={(e) => {
                  // Allow only numbers
                  const value = e.target.value.replace(/\D/g, '') // \D matches any non-digit character
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
                  onClick={() => {
                    setSearchQuery("")
                    setSearchResults(null)
                    onRefresh?.()
                  }}
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
          {selectedCustomers.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedCustomers.length})
            </Button>
          )}
          <Button onClick={handleAddClick}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow key="header">
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={
                      sortedCustomers.length > 0 &&
                      selectedCustomers.length === sortedCustomers.filter(c => c?.id).length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Phone</TableHead>
                {/* <TableHead className="text-center">Branch</TableHead> */}
                {/* <TableHead className="text-center">WhatsApp</TableHead>
                <TableHead className="text-center">SMS</TableHead>
                <TableHead className="text-center">Email Sub</TableHead> */}
                <TableHead className="text-center">Joined Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-6 w-6 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedCustomers.length === 0 ? (
                <TableRow key="no-data">
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                sortedCustomers.map((customer) => (
                  <TableRow key={customer?.id || 'no-id'}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedCustomers.includes(customer?.id)}
                        onCheckedChange={(checked) => handleSelectOne(checked, customer?.id)}
                        aria-label={`Select ${customer?.first_name || 'customer'}`}
                      />
                    </TableCell>
                    <TableCell className="text-left">
                      {customer?.first_name || customer?.last_name ?
                        `${customer.first_name || ''} ${customer.last_name || ''}`.trim() :
                        '-'
                      }
                    </TableCell>
                    <TableCell className="text-center">{customer?.email || '-'}</TableCell>
                    <TableCell className="text-center">{customer?.mobile_number || '-'}</TableCell>
                    {/* <TableCell className="text-center">{customer?.branch_id || '-'}</TableCell> */}
                    {/* <TableCell className="text-center">
                      {customer?.isWhatsApp}
                    </TableCell>
                    <TableCell className="text-center">
                      {customer?.isSMS == 'subscribe' ? (
                        <span className="text-sm font-medium text-blue-600">Subscribed</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">Unsubscribed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {customer?.isEmail === 'subscribe' || customer?.isEmail === undefined ? (
                        <span className="text-sm font-medium text-purple-600">Subscribed</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">Unsubscribed</span>
                      )}
                    </TableCell> */}
                    <TableCell className="text-center">{customer?.created_date ? formatDate(customer.created_date) : '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(customer.id)}
                          className="text-primary hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomers([customer.id]);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {selectedCustomer && (
          <EditCustomerForm
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        <AddCustomerForm
          open={showAddForm}
          onOpenChange={setShowAddForm}
          onSuccess={handleAddSuccess}
        />

        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                selected customers and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

function getCustomerLevelColor(level) {
  switch (level?.toUpperCase()) {
    case 'BRONZE':
      return 'bg-orange-100 text-orange-700'
    case 'SILVER':
      return 'bg-gray-100 text-gray-700'
    case 'GOLD':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
} 