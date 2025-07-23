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
import { Pencil, Trash2, Plus, Loader2, RefreshCw, Search, X, Eye, ArrowUpDown, ArrowUp, ArrowDown, Check, Copy } from "lucide-react"
import { formatDate } from "@/lib/utils"
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
import { format } from "date-fns"
import { discountService } from "@/services/discount.service"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditDiscountRuleForm } from "./edit-discount-rule-form"
import { AddDiscountRuleForm } from "./add-discount-rule-form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export function DiscountRulesTable({
  rules = [],
  isLoading,
  onRefresh,
  sortConfig,
  onSortFieldChange,
  onSortDirectionChange,
  discountTypeFilter = "All",
  onDiscountTypeFilterChange
}) {
  const { toast } = useToast()
  const [selectedRule, setSelectedRule] = useState(null)
  const [selectedRules, setSelectedRules] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [ruleToCopy, setRuleToCopy] = useState(null)
  const router = useRouter()

  // Define sort options for server-side sorting
  const sortOptions = [
    { label: "Name", value: "name" },
    { label: "Rule Code", value: "rule_code" },
    { label: "Created Date", value: "create_date" },
    { label: "Expiry Date", value: "expiry_date" },
    { label: "Amount", value: "amount" },
  ]

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      console.log('[DiscountRulesTable] Clearing search results');
      setSearchResults(null);
      return;
    }

    console.log('[DiscountRulesTable] Initiating backend search with query:', searchQuery);

    try {
      setIsSearching(true);
      const query = searchQuery.trim();

      console.log('[DiscountRulesTable] Calling smart search API with query:', query);

      // First try smart field detection search
      let response = await discountService.searchDiscountRules({
        query: query,
        page: 1,
        limit: 10000, // High limit to get all search results across all pages
        sortBy: sortConfig?.field || 'create_date',
        order: sortConfig?.direction || 'desc',
        discountType: discountTypeFilter !== "All" ? discountTypeFilter : null
      });

      let searchData = response.data || [];

      // If smart search didn't find results, try multi-field search
      if (searchData.length === 0) {
        console.log('[DiscountRulesTable] Smart search returned no results, trying multi-field search');
        response = await discountService.searchDiscountRulesMultiField({
          query: query,
          page: 1,
          limit: 10000,
          sortBy: sortConfig?.field || 'create_date',
          order: sortConfig?.direction || 'desc',
          discountType: discountTypeFilter !== "All" ? discountTypeFilter : null
        });
        searchData = response.data || [];
      }

      console.log(`[DiscountRulesTable] Backend search returned ${searchData.length} matching rules`);

      setSearchResults(searchData);
      setSelectedRules([]);

      toast({
        title: "Search Results",
        description: `Found ${searchData.length} rule(s)`,
      });

    } catch (error) {
      console.error('[DiscountRulesTable] Backend search failed:', {
        error: error.message,
        stack: error.stack,
        query: searchQuery,
        timestamp: new Date().toISOString()
      });

      // If backend search fails, fallback to frontend search on current data
      console.log('[DiscountRulesTable] Falling back to frontend search');
      try {
        const query = searchQuery.toLowerCase().trim();
        let filteredRules = rules.filter(rule =>
        (rule.name?.toLowerCase().includes(query) ||
          rule.rule_code?.toLowerCase().includes(query) ||
          rule.emc_code?.toLowerCase().includes(query))
        );

        // Apply discount type filter on fallback search
        if (discountTypeFilter !== "All") {
          filteredRules = filteredRules.filter(rule =>
            rule.discount_rule_type === discountTypeFilter
          );
        }

        setSearchResults(filteredRules);
        setSelectedRules([]);

        toast({
          title: "Search Results (Local)",
          description: `Found ${filteredRules.length} rule(s) in current page`,
        });
      } catch (fallbackError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: 'Failed to search rules',
        });
      }
    } finally {
      console.log('[DiscountRulesTable] Search completed');
      setIsSearching(false);
    }
  }

  const clearSearch = () => {
    console.log('[DiscountRulesTable] Clearing search');
    setSearchQuery("");
    setSearchResults(null);
  }

  const handleDiscountTypeFilter = async (type) => {
    console.log(`[DiscountRulesTable] Changing discount type filter to: ${type}`);

    // Use the parent's filter change handler
    onDiscountTypeFilterChange?.(type);

    // If there's an active search, re-run it with the new filter
    if (searchQuery.trim()) {
      // Small delay to allow parent state to update
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }

  const handleSelectAll = (checked) => {
    const displayRules = searchResults || rules;
    const newSelection = checked ? displayRules.map(rule => rule.id) : [];
    console.log(`[DiscountRulesTable] ${checked ? 'Selected all' : 'Deselected all'} rules`, {
      count: newSelection.length,
      selectedIds: newSelection
    });
    setSelectedRules(newSelection);
  }

  const handleSelectOne = (checked, ruleId) => {
    setSelectedRules(current => {
      const newSelection = checked
        ? [...current, ruleId]
        : current.filter(id => id !== ruleId);

      console.log(`[DiscountRulesTable] Rule ${ruleId} ${checked ? 'selected' : 'deselected'}`, {
        totalSelected: newSelection.length,
        selected: checked
      });

      return newSelection;
    });
  }

  const handleDelete = async () => {
    if (isDeleting) {
      console.log('[DiscountRulesTable] Delete operation already in progress');
      return;
    }

    console.log('[DiscountRulesTable] Initiating delete for rules:', selectedRules);

    try {
      setIsDeleting(true);
      console.log('[DiscountRulesTable] Sending delete request for rules:', selectedRules);

      await discountService.deleteDiscountRules(selectedRules);

      console.log(`[DiscountRulesTable] Successfully deleted ${selectedRules.length} rule(s)`);

      setShowDeleteDialog(false);
      setSelectedRules([]);

      toast({
        title: "Success",
        description: `${selectedRules.length} rule(s) deleted successfully`,
      });

      console.log('[DiscountRulesTable] Refreshing table data after delete');
      await onRefresh?.();

    } catch (error) {
      console.error('[DiscountRulesTable] Delete operation failed:', {
        error: error.message,
        stack: error.stack,
        ruleIds: selectedRules,
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to delete rules',
      });
    } finally {
      console.log('[DiscountRulesTable] Delete operation completed');
      setIsDeleting(false);
    }
  }

  // Display rules (either search results or all rules)
  // Note: Discount type filtering is now handled by the API, not here
  const displayRules = searchResults || rules;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CardTitle>{searchResults ? "Search Results" : "Discount Rules"}</CardTitle>
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
                  onClick={() => onSortFieldChange?.(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {sortConfig?.field === option.value && (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort Direction</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onSortDirectionChange?.("asc")}
                className="flex items-center justify-between"
              >
                Ascending
                {sortConfig?.direction === "asc" && (
                  <ArrowUp className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSortDirectionChange?.("desc")}
                className="flex items-center justify-between"
              >
                Descending
                {sortConfig?.direction === "desc" && (
                  <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {discountTypeFilter}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel>Discount Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDiscountTypeFilter("All")}
                className="flex items-center justify-between"
              >
                All
                {discountTypeFilter === "All" && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDiscountTypeFilter("CUSTOMER")}
                className="flex items-center justify-between"
              >
                CUSTOMER
                {discountTypeFilter === "CUSTOMER" && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDiscountTypeFilter("INTERNAL")}
                className="flex items-center justify-between"
              >
                INTERNAL
                {discountTypeFilter === "INTERNAL" && (
                  <Check className="ml-2 h-4 w-4" />
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
                placeholder="Search by Name, Rule ID, or EMC Code..."
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



          {selectedRules.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRules.length})
            </Button>
          )}
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={displayRules.length > 0 && selectedRules.length === displayRules.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Rule ID</TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="text-center">Discount</TableHead>
                <TableHead className="text-center">EMC Code</TableHead>
                <TableHead className="text-center">Discount Type</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={9} className="text-center py-8">
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
              ) : displayRules.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No matching rules found' : 'No rules found'}
                  </TableCell>
                </TableRow>
              ) : (
                displayRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedRules.includes(rule.id)}
                        onCheckedChange={(checked) => handleSelectOne(checked, rule.id)}
                      />
                    </TableCell>
                    <TableCell className="text-center">{rule.name}</TableCell>
                    <TableCell className="text-center">{rule.rule_code}</TableCell>
                    <TableCell className="text-center">{rule.description}</TableCell>
                    <TableCell className="text-center">
                      {rule.amount !== undefined && rule.amount !== null
                        ? `$${rule.amount}`
                        : `${rule.percentage}%`}
                    </TableCell>
                    <TableCell className="text-center">{rule.emc_code}</TableCell>
                    <TableCell className="text-center">
                      {rule.discount_rule_type}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={async (checked) => {
                            try {
                              console.log(`[DiscountRulesTable] Toggling status for rule ${rule.id} to ${checked}`);
                              await discountService.updateDiscountRule(rule.id, {
                                ...rule,
                                is_active: checked
                              });
                              toast({
                                title: "Success",
                                description: `Rule marked as ${checked ? 'Active' : 'Inactive'}`,
                              });
                              onRefresh?.();
                            } catch (error) {
                              console.error(`[DiscountRulesTable] Failed to toggle status for rule ${rule.id}:`, error);
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: error.message || 'Failed to update rule status',
                              });
                            }
                          }}
                          disabled={isLoading}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Badge
                          variant={rule.is_active ? "default" : "secondary"}
                          className={rule.is_active
                            ? "bg-green-600 hover:bg-green-700 font-medium"
                            : "bg-gray-400 hover:bg-gray-500 font-medium"
                          }
                        >
                          {rule.is_active ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/discount/rules/${rule.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRule(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRuleToCopy(rule);
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
              Are you sure you want to duplicate the rule <b>{ruleToCopy?.name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!ruleToCopy) return;
                try {
                  toast({ title: "Copying...", description: `Duplicating rule '${ruleToCopy.name}'` });
                  await discountService.copyDiscountRule(ruleToCopy.id);
                  toast({ title: "Success", description: `Rule duplicated successfully` });
                  setShowCopyDialog(false);
                  setRuleToCopy(null);
                  onRefresh?.();
                } catch (error) {
                  toast({ variant: "destructive", title: "Error", description: error.message || 'Failed to copy rule' });
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
                          onClick={() => {
                            setSelectedRules([rule.id])
                            setShowDeleteDialog(true)
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
      </CardContent>

      {/* Forms and Dialogs */}
      <EditDiscountRuleForm
        rule={selectedRule || {}}
        onClose={() => setSelectedRule(null)}
        onSuccess={() => {
          setSelectedRule(null)
          onRefresh?.()
        }}
        isOpen={!!selectedRule}
        onOpenChange={(open) => !open && setSelectedRule(null)}
      />

      <AddDiscountRuleForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={() => {
          setShowAddForm(false)
          onRefresh?.()
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected rule(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 
