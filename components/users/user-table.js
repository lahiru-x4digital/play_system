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
import { UserPlus, Pencil, Trash2, Search, X, ArrowUpDown, ArrowUp, ArrowDown, Check, Eye, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { EditUserForm } from "./edit-user-form"
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
import { userService } from "@/services/user.service"
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
import { AddUserForm } from "./add-user-form"
import { useRouter } from "next/navigation"
import { LocationFilter } from "@/components/filters/location-filter"

const userTypes = [
  { value: "SUPERADMIN", label: "Super Admin" },
  { value: "BRANCH_USER", label: "Branch User" },
  { value: "BRANCH_MANAGER", label: "Branch Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "Care Team" },
]

export function UsersTable({
  users = [],
  onAddClick,
  onRefresh,
  sortConfig: initialSortConfig,
  onSortFieldChange,
  onSortDirectionChange,
  userType,
  userBranchId,
  onUserTypeFilterChange
}) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [localUsers, setLocalUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isBranchChanging, setIsBranchChanging] = useState(false)

  const [localSortConfig, setLocalSortConfig] = useState({
    field: initialSortConfig?.field || 'created_date',
    direction: initialSortConfig?.direction || 'desc'
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()

  // Define sort options array
  const sortOptions = [
    { label: 'User ID', value: 'user_id' },
    { label: 'Name', value: 'name' },
    { label: 'Phone', value: 'mobile_number' },
    { label: 'Joined Date', value: 'created_date' }
  ]

  // Create sort fields configuration
  const sortFields = createSortFields([
    {
      label: 'User ID',
      value: 'user_id',
      type: 'userId'
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

  // Update localUsers when users prop changes
  useEffect(() => {
    if (mounted) {
      setLocalUsers(users)
    }
  }, [users, mounted])

  const displayUsers = useMemo(() => {
    if (!mounted) return []
    let users = searchResults?.users || localUsers || []
    
    // Apply userType filter
    if (userTypeFilter !== "all") {
      users = users.filter(user => user?.user_type === userTypeFilter)
    }
    
    // Apply location filter
    if (selectedLocation?.id) {
      users = users.filter(user => user?.branch_id === selectedLocation.id)
    }
    
    return users
  }, [searchResults, localUsers, mounted, userTypeFilter, selectedLocation])

  const sortedUsers = useMemo(() => {
    if (!mounted) return []
    return sortData(displayUsers, localSortConfig, sortFields)
  }, [displayUsers, localSortConfig, mounted])

  // Logging effects after all variables are initialized
  useEffect(() => {
    console.group('Users Table State')
    console.log('Initial Users:', users)
    console.log('Local Users:', localUsers)
    console.log('Display Users:', displayUsers)
    console.log('Sorted Users:', sortedUsers)
    console.groupEnd()
  }, [users, localUsers, displayUsers, sortedUsers])

  useEffect(() => {
    if (searchResults) {
      console.log('Search Results:', searchResults)
    }
  }, [searchResults])

  const handleSelectAll = (checked) => {
    if (checked) {
      // Use id instead of _id and ensure we only select valid IDs
      setSelectedUsers(sortedUsers
        .filter(user => user?.id)
        .map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectOne = (checked, userId) => {
    if (!userId) return // Guard against invalid IDs

    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      setShowDeleteDialog(false)

      if (selectedUsers.length === 1) {
        await userService.deleteUser(selectedUsers[0])
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
      } else {
        await userService.deleteUsers(selectedUsers)
        toast({
          title: "Success",
          description: `${selectedUsers.length} users deleted successfully`,
        })
      }

      setSelectedUsers([])
      await onRefresh?.()
    } catch (error) {
      console.error('Failed to delete users:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to delete users',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = async () => {
    setSelectedUser(null)
    await onRefresh?.()
  }

  const handleSearch = async (e, newPage = 1, newLimit = 10) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)

      const isEmail = searchQuery.includes('@') && searchQuery.includes('.')
      
      const result = isEmail 
        ? await userService.searchUserByEmail(searchQuery)
        : await userService.searchUserByMobile(searchQuery)

      if (result.success && result.data?.users) {
        setSearchResults(result.data)
        setSelectedUsers([])
        toast({
          title: "Search Results",
          description: `Found ${result.data.users.length} user(s)`,
        })
      } else {
        setSearchResults(null)
        toast({
          title: "No Results",
          description: `No users found with this ${isEmail ? 'email' : 'mobile number'}`,
        })
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to search users',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationChange = async ({ branchId, branchObj }) => {
    // Prevent multiple rapid branch changes
    if (isBranchChanging) return;

    try {
      setIsBranchChanging(true);
      setSelectedLocation(branchObj);
      
      // Clear search results when location changes
      if (searchResults) {
        setSearchResults(null);
        setSearchQuery("");
      }
      
      // Refresh user data for the selected location if needed
      await onRefresh?.();
      
    } catch (error) {
      console.error('Failed to change location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to change location',
      });
    } finally {
      setIsBranchChanging(false);
    }
  };

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

  const handleViewDetails = (userId) => {
    router.push(`/dashboard/users/${userId}`)
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
    <div>
      {/* Location filter component */}
      <div className="mb-2">
        <LocationFilter
          userType={userType || "SUPERADMIN"}
          userBranchId={userBranchId}
          onSearch={handleLocationChange}
          showOnlyForSuperadmin={false}
        />
      </div>
      <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CardTitle>
            {searchResults ? 'Search Results' : 'User Details'}
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
                Filter by User Type
                <Filter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by User Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setUserTypeFilter("all")
                  onUserTypeFilterChange?.("all")
                }}
                className="flex items-center justify-between"
              >
                All Users
                {userTypeFilter === "all" && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </DropdownMenuItem>
              {userTypes.map((userType) => (
                <DropdownMenuItem
                  key={userType.value}
                  onClick={() => {
                    setUserTypeFilter(userType.value)
                    onUserTypeFilterChange?.(userType.value)
                  }}
                  className="flex items-center justify-between"
                >
                  {userType.label}
                  {userTypeFilter === userType.value && (
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
                placeholder="Search by email or mobile number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
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
          {selectedUsers.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
          <Button onClick={handleAddClick}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
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
                      sortedUsers.length > 0 &&
                      selectedUsers.length === sortedUsers.filter(u => u?.id).length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-center">Email</TableHead>
                {/* <TableHead className="text-center">Phone</TableHead> */}
                {/* <TableHead className="text-center">Brand</TableHead> */}
                <TableHead className="text-center">Branch ID</TableHead>
                <TableHead className="text-center">Branch Name</TableHead>
                {/* <TableHead className="text-center">Language</TableHead> */}
                <TableHead className="text-center">User Type</TableHead>
                {/* <TableHead className="text-center">Joined Date</TableHead> */}
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
              ) : sortedUsers.length === 0 ? (
                <TableRow key="no-data">
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user?.id || 'no-id'}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedUsers.includes(user?.id)}
                        onCheckedChange={(checked) => handleSelectOne(checked, user?.id)}
                        aria-label={`Select ${user?.first_name || 'user'}`}
                      />
                    </TableCell>
                    <TableCell className="text-left">
                      {user?.first_name || user?.last_name ?
                        `${user.first_name || ''} ${user.last_name || ''}`.trim() :
                        '-'
                      }
                    </TableCell>
                    <TableCell className="text-center">{user?.email || '-'}</TableCell>
                    {/* <TableCell className="text-center">{user?.mobile_number || '-'}</TableCell> */}
                    <TableCell className="text-center">{user?.branch?.branch_code || '-'}</TableCell>
                    <TableCell className="text-center">{user?.branch?.branch_name || '-'}</TableCell>
                    {/* <TableCell className="text-center">{user?.preferred_language || '-'}</TableCell> */}
                    <TableCell className="text-center">{user?.user_type || '-'}</TableCell>
                    {/* <TableCell className="text-center">{formatDate(user?.created_date) || '-'}</TableCell> */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(user.id)}
                          className="text-primary hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUsers([user.id]);
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
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        <AddUserForm
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
                selected users and remove their data from our servers.
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
    </div>
  )
}

