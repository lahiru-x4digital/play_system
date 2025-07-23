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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Copy, Loader2, Plus, ArrowUpDown, ArrowUp, ArrowDown, Check, X, Search, Eye } from "lucide-react"
import { format } from "date-fns"
import { discountService } from "@/services/discount.service"
import { useToast } from "@/hooks/use-toast"
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
import { EditDiscountCodeForm } from "./edit-discount-code-form"
import { AddDiscountCodeForm } from "./add-discount-code-form"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// Add these utility functions at the top of the file
const defaultComparators = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
  date: (a, b) => new Date(a) - new Date(b),
  name: (a, b) => {
    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
    return nameA.localeCompare(nameB)
  }
}

const createSortFields = (fields) => {
  return fields.reduce((acc, field) => {
    acc[field.value] = {
      ...field,
      comparator: field.comparator || defaultComparators[field.type] || defaultComparators.string
    }
    return acc
  }, {})
}

const sortData = (data, sortConfig, sortFields) => {
  if (!sortConfig?.field || !data?.length) return data

  const sortField = sortFields[sortConfig.field]
  if (!sortField) return data

  return [...data].sort((a, b) => {
    const result = sortField.comparator(
      sortConfig.field,
      sortField.type,
      a,
      b
    )
    return sortConfig.direction === 'asc' ? result : -result
  })
}

export function DiscountCodesTable({
  codes = [],
  isLoading,
  sortConfig: initialSortConfig,
  onSortFieldChange,
  onSortDirectionChange,
  onRefresh
}) {
  const { toast } = useToast()
  const [localCodes, setLocalCodes] = useState([])
  const [selectedCode, setSelectedCode] = useState(null)
  const [selectedCodes, setSelectedCodes] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [duplicateCode, setDuplicateCode] = useState(null)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [codeToCopy, setCodeToCopy] = useState(null)
  const [localSortConfig, setLocalSortConfig] = useState(initialSortConfig)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const router = useRouter()

  // Define sort options array
  const sortOptions = [
    { label: 'Code', value: 'code' },
    { label: 'Name', value: 'name' },
    { label: 'Expiry Date', value: 'expire_date' },
    { label: 'Created Date', value: 'created_date' }
  ]

  // Create sort fields configuration
  const sortFields = createSortFields([
    {
      label: 'Code',
      value: 'code',
      type: 'string'
    },
    {
      label: 'Name',
      value: 'name',
      type: 'string'
    },
    {
      label: 'Expiry Date',
      value: 'expire_date',
      type: 'date'
    },
    {
      label: 'Created Date',
      value: 'created_date',
      type: 'date'
    }
  ])

  // Update localCodes when codes prop changes
  useEffect(() => {
    setLocalCodes(codes)
  }, [codes])

  // Update localSortConfig when prop changes
  useEffect(() => {
    setLocalSortConfig(initialSortConfig)
  }, [initialSortConfig])

  const displayCodes = useMemo(() => {
    return searchResults?.codes || localCodes || []
  }, [searchResults, localCodes])

  const sortedCodes = useMemo(() => {
    return sortData(displayCodes, localSortConfig, sortFields)
  }, [displayCodes, localSortConfig])

  const handleSelectAll = (checked) => {
    const displayCodes = searchResults?.codes || localCodes || []
    if (checked) {
      setSelectedCodes(displayCodes.map(code => code.id))
    } else {
      setSelectedCodes([])
    }
  }

  const handleSelectOne = (checked, codeId) => {
    if (checked) {
      setSelectedCodes([...selectedCodes, codeId])
    } else {
      setSelectedCodes(selectedCodes.filter(id => id !== codeId))
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)

      if (selectedCodes.length === 1) {
        await discountService.deleteDiscountCode(selectedCodes[0])
      } else {
        await discountService.deleteDiscountCodes(selectedCodes)
      }

      setShowDeleteDialog(false)
      setSelectedCodes([])
      toast({
        title: "Success",
        description: `${selectedCodes.length} discount code(s) deleted successfully`,
      })

      await onRefresh()

      // The pagination logic is now handled by the parent component
      // if (localCodes.length === selectedCodes.length && pagination.currentPage > 1) {
      //   await onPageChange(pagination.currentPage - 1)
      // }

    } catch (error) {
      console.error('Failed to delete discount codes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to delete discount codes',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getDiscountValue = (code) => {
    if (code.amount !== null && code.amount !== undefined) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ${parseFloat(code.amount).toFixed(2)}
        </span>
      )
    }
    if (code.percentage !== null && code.percentage !== undefined) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {parseFloat(code.percentage).toFixed(2)}%
        </span>
      )
    }
    return 'N/A'
  }





  const renderTableRow = (code) => (
    <TableRow key={code.id}>
      <TableCell>
        <Checkbox
          checked={selectedCodes.includes(code.id)}
          onCheckedChange={(checked) => handleSelectOne(checked, code.id)}
        />
      </TableCell>
      <TableCell className="font-medium">{code.code}</TableCell>
      <TableCell>{code.name}</TableCell>
      <TableCell>{getDiscountValue(code)}</TableCell>
      <TableCell>{code.emc_code}</TableCell>
      <TableCell>
        {code.expire_date
          ? format(new Date(code.expire_date), "MMM dd, yyyy")
          : 'No expiry'
        }
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={code.is_active}
            onCheckedChange={async (checked) => {
              try {
                console.log(`[DiscountCodesTable] Toggling status for code ${code.id} to ${checked}`);
                await discountService.updateDiscountCode(code.id, {
                  ...code,
                  is_active: checked
                });
                toast({
                  title: "Success",
                  description: `Code marked as ${checked ? 'Active' : 'Inactive'}`,
                });
                onRefresh?.();
              } catch (error) {
                console.error(`[DiscountCodesTable] Failed to toggle status for code ${code.id}:`, error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: error.message || 'Failed to update code status',
                });
              }
            }}
            disabled={isLoading}
            onClick={(e) => e.stopPropagation()}
          />
          <Badge
            variant={code.is_active ? "default" : "secondary"}
            className={code.is_active
              ? "bg-green-600 hover:bg-green-700 font-medium"
              : "bg-gray-400 hover:bg-gray-500 font-medium"
            }
          >
            {code.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </TableCell>
      {/* <TableCell><Badge
            variant={code.is_Bulk ? "default" : "secondary"}
            className={code.is_Bulk
              ? "bg-red-600 hover:bg-red-700 font-medium"
              : "bg-blue-400 hover:bg-blue-500 font-medium"
            }
          >
            {code.is_Bulk ? "Bulk" : "Single"}
          </Badge></TableCell> */}
      <TableCell>
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCode(code)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCodeToCopy(code);
              setShowCopyDialog(true);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
      {/* Copy Confirmation Dialog */}
      <AlertDialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Copy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to duplicate the code <b>{codeToCopy?.code}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!codeToCopy) return;
                try {
                  toast({ title: "Copying...", description: `Duplicating code '${codeToCopy.code}'` });
                  await discountService.copyDiscountCode(codeToCopy.id);
                  toast({ title: "Success", description: `Code duplicated successfully` });
                  setShowCopyDialog(false);
                  setCodeToCopy(null);
                  onRefresh?.();
                } catch (error) {
                  toast({ variant: "destructive", title: "Error", description: error.message || 'Failed to copy code' });
                }
              }}
              autoFocus
            >
              Copy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/discount/codes/${code.id}`)}
            className="text-primary hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCodes([code.id]);
              setShowDeleteDialog(true);
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )

  // Update the local codes when a code is edited
  const handleCodeEdit = (editedCode) => {
    try {
      setLocalCodes(prevCodes =>
        prevCodes.map(code =>
          code.id === editedCode.id ? {
            ...code,
            ...editedCode,
            amount: editedCode.discount_type === 'amount' ? editedCode.discount_value : undefined,
            precentage: editedCode.discount_type === 'precentage' ? editedCode.discount_value : undefined
          } : code
        )
      )

      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error updating local codes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the table view"
      })
    }
  }

  // Update the sort handlers
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

  const handleSearch = async (e) => {
    e?.preventDefault()

    if (!searchQuery.trim()) {
      console.log('[DiscountCodesTable] Clearing search results')
      setSearchResults(null)
      return
    }

    console.log('[DiscountCodesTable] Initiating search with query:', searchQuery)

    try {
      setIsSearching(true)
      const query = searchQuery.toLowerCase().trim()

      console.log('[DiscountCodesTable] Filtering codes with query:', query)

      // Filter local codes by name or code
      const filteredCodes = localCodes.filter(code =>
      (code.name?.toLowerCase().includes(query) ||
        code.code?.toLowerCase().includes(query))
      )

      console.log(`[DiscountCodesTable] Found ${filteredCodes.length} matching codes`)

      setSearchResults({ codes: filteredCodes })
      setSelectedCodes([])

      toast({
        title: "Search Results",
        description: `Found ${filteredCodes.length} discount code(s)`,
      })

    } catch (error) {
      console.error('[DiscountCodesTable] Search failed:', {
        error: error.message,
        stack: error.stack,
        query: searchQuery,
        timestamp: new Date().toISOString()
      })

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to search discount codes',
      })
    } finally {
      console.log('[DiscountCodesTable] Search completed')
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    console.log('[DiscountCodesTable] Clearing search')
    setSearchQuery("")
    setSearchResults(null)
  }

  return (
    <>
      <AddDiscountCodeForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSubmit={async (data) => {
          console.log('DiscountCodesTable received form data:', data)
          try {
            console.log('Calling discountService.createDiscountCode...')
            const response = await discountService.createDiscountCode(data)
            // console.log('API Response:', response)

            // Check for failed items in the response
            if (response.data.failed && response.data.failed.length > 0) {
              throw new Error(response.data.failed[0].error || 'Failed to create discount code')
            }

            // Only proceed if we have successful items
            if (response.data.successful && response.data.successful.length > 0) {
              console.log('Discount code created successfully, refreshing table...')
              await onRefresh()
              setShowAddForm(false)
              toast({
                title: "Success",
                description: "Discount code created successfully"
              })
            } else {
              throw new Error('No discount code was created')
            }
          } catch (error) {
            console.error('Create discount code error:', {
              error,
              message: error.message,
              response: error.response,
              responseData: error.response?.data
            })
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to create discount code"
            })
          }
        }}
      />
      {selectedCode ? (
        <EditDiscountCodeForm
          code={selectedCode}
          onClose={() => setSelectedCode(null)}
          onSuccess={onRefresh}
        />
      ) : duplicateCode ? (
        <AddDiscountCodeForm
          initialData={duplicateCode}
          onSuccess={onRefresh}
          onClose={() => {
            setSelectedCode(null)
            setDuplicateCode(null)
          }}
          open={!!duplicateCode}
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <CardTitle>
                {searchResults ? 'Search Results' : 'Discount Codes'}
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
                      {localSortConfig?.field === option.value && (
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
                    {localSortConfig?.direction === 'asc' && (
                      <ArrowUp className="ml-2 h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortDirectionChange('desc')}
                    className="flex items-center justify-between"
                  >
                    Descending
                    {localSortConfig?.direction === 'desc' && (
                      <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search by Name or Code..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (!e.target.value.trim()) {
                        clearSearch()
                      }
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
                      onClick={clearSearch}
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
              {selectedCodes.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedCodes.length})
                </Button>
              )}
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Code
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow key="header">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedCodes.length === displayCodes.length && displayCodes.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Code ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>EMC Code</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead>Quantity</TableHead> */}
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sortedCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No discount codes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCodes.map(renderTableRow)
                  )}
                </TableBody>
              </Table>
            </div>
            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={(open) => {
                if (!isDeleting) {
                  setShowDeleteDialog(open)
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    selected discount code{selectedCodes.length > 1 ? 's' : ''}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </>
  )
} 