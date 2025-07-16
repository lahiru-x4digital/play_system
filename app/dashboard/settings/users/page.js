"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTable } from "@/components/users/user-table"
import { AddUserForm } from "@/components/users/add-user-form"
import { userService } from "@/services/user.service"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [userIdFilter, setUserIdFilter] = useState("")
  const [sortConfig, setSortConfig] = useState({
    field: 'created_date',
    direction: 'desc'
  })

  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoading(true)

      let response;

      // If we have a specific user type filter (not "all"), use the getUsersByType method
      if (userTypeFilter !== "all") {
        response = await userService.getUsersByType({
          user_type: userTypeFilter,
          userId: userIdFilter || null,
          page: Number(page),
          limit: Number(limit)
        })
      } else {
        // Use the regular getUsers method with user_type parameter if needed
        const params = {
          page: Number(page),
          limit: Number(limit),
          skip: (Number(page) - 1) * Number(limit)
        }

        // Add user ID filter to params if provided
        if (userIdFilter) {
          params.id = userIdFilter
        }

        response = await userService.getUsers(params)
      }

      if (response.success) {
        // Handle different response structures
        const userData = response.data?.users || response.data || []
        const total = response.data?.total || response.total || 0
        const pages = response.data?.pages || response.pages || 1
        const currentPageNum = response.data?.page || response.page || 1

        setUsers(userData)
        setTotalItems(Number(total))
        setTotalPages(Number(pages))
        setCurrentPage(Number(currentPageNum))
      } else {
        throw new Error(response.message || 'Failed to fetch users')
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load users"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, userTypeFilter, userIdFilter, pageSize])

  useEffect(() => {
    fetchUsers(currentPage, pageSize)
  }, [fetchUsers, currentPage, pageSize])

  // Refetch users when filters change and reset to first page
  useEffect(() => {
    setCurrentPage(1)
    fetchUsers(1, pageSize)
  }, [userTypeFilter, fetchUsers, pageSize])

  // Debounced effect for user ID filter to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchUsers(1, pageSize)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [userIdFilter, fetchUsers, pageSize])

  const handlePageChange = (newPage) => {
    setCurrentPage(Number(newPage))
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleSortFieldChange = (field) => {
    setSortConfig(current => ({
      ...current,
      field
    }))
  }

  const handleSortDirectionChange = (direction) => {
    setSortConfig(current => ({
      ...current,
      direction
    }))
  }

  const handleUserTypeFilterChange = (userType) => {
    setUserTypeFilter(userType)
  }

  const handleUserIdFilterChange = (userId) => {
    setUserIdFilter(userId)
  }

  return (
    <div className="container space-y-4">
      <UsersTable
        users={users}
        onRefresh={() => fetchUsers(currentPage, pageSize)}
        sortConfig={sortConfig}
        onSortFieldChange={handleSortFieldChange}
        onSortDirectionChange={handleSortDirectionChange}
        onUserTypeFilterChange={handleUserTypeFilterChange}
        onUserIdFilterChange={handleUserIdFilterChange}
      />
      <Pagination
        currentPage={Number(currentPage)}
        totalPages={Number(totalPages)}
        pageSize={Number(pageSize)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        total={Number(totalItems)}
      />
    </div>
  )
}