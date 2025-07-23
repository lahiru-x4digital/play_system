"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { menuItemDiscountService } from "@/services/menu-item-discount.service"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { 
  Plus, 
  Search, 
  X, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Check,
  Trash2,
  Loader2,
  Eye,
  Pencil,
  Copy
} from "lucide-react"
import { AddMenuItemDiscountForm } from "@/components/discount/add-menu-item-discount-form"
import { useRouter } from "next/navigation"
import { EditMenuItemDiscountForm } from "@/components/discount/edit-menu-item-discount-form"

const sortOptions = [
  { label: "Discount ID", value: "discount_id" },
  { label: "Name", value: "discount_name" },
  { label: "Expiry Date", value: "expiry_date" },
]

export function MenuItemDiscountsTable({ 
  discounts = [], 
  isLoading, 
  pagination,
  onPageChange,
  onPageSizeChange,
  sortConfig: initialSortConfig,
  onSortFieldChange,
  onSortDirectionChange,
  onRefresh 
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [selectedDiscounts, setSelectedDiscounts] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [duplicateDiscount, setDuplicateDiscount] = useState(null)
  const [localDiscounts, setLocalDiscounts] = useState(discounts)
  const [localSortConfig, setLocalSortConfig] = useState(initialSortConfig || {
    field: "discount_id",
    direction: "asc"
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [discountToCopy, setDiscountToCopy] = useState(null)

  useEffect(() => {
    setLocalDiscounts(discounts)
  }, [discounts])

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = localDiscounts.map(discount => discount.id)
      setSelectedDiscounts(allIds)
    } else {
      setSelectedDiscounts([])
    }
  }

  const handleSelectOne = (checked, discountId) => {
    setSelectedDiscounts(prev => {
      if (checked) {
        return [...prev, discountId]
      } else {
        return prev.filter(id => id !== discountId)
      }
    })
  }

  const handleDelete = async () => {
    if (isDeleting) return
    
    try {
      setIsDeleting(true)
      
      if (selectedDiscounts.length === 1) {
        await menuItemDiscountService.deleteMenuItemDiscount(selectedDiscounts[0])
      } else {
        await Promise.all(
          selectedDiscounts.map(id => menuItemDiscountService.deleteMenuItemDiscount(id))
        )
      }
      
      toast({
        title: "Success",
        description: `Successfully deleted ${selectedDiscounts.length} discount${selectedDiscounts.length > 1 ? 's' : ''}`
      })
      
      setSelectedDiscounts([])
      setShowDeleteDialog(false)
      onRefresh?.()
      
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete selected discounts"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || isSearching) return

    try {
      setIsSearching(true)
      const results = await menuItemDiscountService.searchMenuItemDiscounts(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search discounts"
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

  const handleAddSuccess = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  const sortedDiscounts = [...localDiscounts].sort((a, b) => {
    const field = localSortConfig.field
    const direction = localSortConfig.direction === 'asc' ? 1 : -1
    
    if (field === 'expiry_date') {
      return direction * (new Date(a[field]) - new Date(b[field]))
    }
    
    return direction * a[field].localeCompare(b[field])
  })

  const handleSingleDelete = (discountId) => {
    setSelectedDiscounts([discountId])
    setShowDeleteDialog(true)
  }

  return (
    <>
      {isLoading ? (
        <Skeleton className="w-full h-[400px]" />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <CardTitle>
                {searchResults ? 'Search Results' : 'Menu Item Discounts'}
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
                    placeholder="Search discounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
              {selectedDiscounts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedDiscounts.length})
                </Button>
              )}
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Discount
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedDiscounts.length === localDiscounts.length && localDiscounts.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Discount ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>EMC Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sortedDiscounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No menu item discounts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedDiscounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDiscounts.includes(discount.id)}
                            onCheckedChange={(checked) => handleSelectOne(checked, discount.id)}
                          />
                        </TableCell>
                        <TableCell>{discount.discount_id}</TableCell>
                        <TableCell>{discount.discount_name}</TableCell>
                        <TableCell>{discount.emc_code}</TableCell>
                        <TableCell>
                          {discount.description ? discount.description : "-"}
                        </TableCell>
                        <TableCell>
                          {discount.expiry_date ? 
                            format(new Date(discount.expiry_date), "PPP") : 
                            "No Expiry Date"
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Switch
                              checked={discount.is_active}
                              onCheckedChange={async (checked) => {
                                try {
                                  await menuItemDiscountService.updateMenuItemDiscountStatus(discount.id, checked)
                                  onRefresh?.()
                                } catch (err) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: err.message || "Failed to update status"
                                  })
                                }
                              }}
                              disabled={isLoading}
                              onClick={e => e.stopPropagation()}
                            />
                            <Badge
                              variant={discount.is_active ? "default" : "secondary"}
                              className={discount.is_active
                                ? "bg-green-600 hover:bg-green-700 font-medium"
                                : "bg-gray-400 hover:bg-gray-500 font-medium"
                              }
                            >
                              {discount.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDiscount({
                                  ...discount,
                                  countries: discount.countries?.map(c => ({
                                    country_id: c.country_id?.toString()
                                  })) || [],
                                  brands: discount.brands?.map(b => ({
                                    brand_id: b.brand_id?.toString()
                                  })) || [],
                                  branches: discount.branches?.map(b => ({
                                    branch_id: b.branch_id?.toString()
                                  })) || [],
                                  menu_items: discount.menu_items?.map(m => ({
                                    menu_item_id: m.menu_item_id?.toString()
                                  })) || []
                                })
                                setShowEditForm(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDiscountToCopy(discount);
                                setShowCopyDialog(true);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/discount/menu-items/${discount.id}/view`)}
                              className="text-primary hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSingleDelete(discount.id)}
                              className="text-destructive hover:text-destructive"
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
            <AlertDialog 
              open={showDeleteDialog} 
              onOpenChange={(open) => {
                if (!isDeleting) {
                  setShowDeleteDialog(open)
                  if (!open) {
                    setSelectedDiscounts([])
                  }
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete 
                    {selectedDiscounts.length === 1 ? ' this discount' : ` these ${selectedDiscounts.length} discounts`}.
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

      <AddMenuItemDiscountForm 
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={handleAddSuccess}
        onClose={() => {
          setSelectedDiscount(null)
          setDuplicateDiscount(null)
        }}
      />

      {selectedDiscount && (
        <EditMenuItemDiscountForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSuccess={() => {
            setShowEditForm(false)
            setSelectedDiscount(null)
            onRefresh?.()
          }}
          initialData={selectedDiscount}
        />
      )}

      {/* Copy Confirmation Dialog */}
      <AlertDialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Copy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to duplicate the discount <b>{discountToCopy?.discount_name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!discountToCopy) return;
                try {
                  toast({ title: "Copying...", description: `Duplicating discount '${discountToCopy.discount_name}'` });
                  await menuItemDiscountService.duplicateMenuItemDiscount(discountToCopy.id);
                  toast({ title: "Success", description: `Discount duplicated successfully` });
                  setShowCopyDialog(false);
                  setDiscountToCopy(null);
                  onRefresh?.();
                } catch (error) {
                  toast({ 
                    variant: "destructive", 
                    title: "Error", 
                    description: error.message || 'Failed to copy discount' 
                  });
                }
              }}
              autoFocus
            >
              Copy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}