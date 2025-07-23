"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomersTable } from "@/components/customers/customers-table"
import { AddCustomerForm } from "@/components/customers/add-customer-form"
import { customerService } from "@/services/customer.service"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

export default function CustomersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [customerTypes, setCustomerTypes] = useState([])
  const [selectedCustomerType, setSelectedCustomerType] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    field: 'created_date',
    direction: 'desc'
  })
  
  // Add user session state
  const [userBranchId, setUserBranchId] = useState(null)
  const [userType, setUserType] = useState(null)

  // Get user session data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user) {
          // Only set branchId if it exists, SUPERADMIN might not have one
          if (session.user.branchId) {
            setUserBranchId(session.user.branchId);
          }
          setUserType(session.user.user_type);
        }
      } catch (error) {
        console.error('Error getting user session data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
      }
    };

    getUserData();
  }, []);

  const fetchCustomers = useCallback(async (page = 1, limit = 10, customerType = null) => {
    // Skip if we don't have the required user data yet
    if (userType === null) return;
    
    // For non-SUPERADMIN users, we need a branchId
    if (userType !== 'SUPERADMIN' && userType !== 'USER' && userType !== 'ORGANIZATION_USER' && !userBranchId) {
      console.log('Branch ID is required for this user type');
      return;
    }
    
    try {
      setIsLoading(true)
      
      // Build filter parameters - apply branch filtering for non-SUPERADMIN users
      const filterParams = {
        page: Number(page),
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        customer_type: customerType,
        branch_id: (userType !== 'SUPERADMIN' && userType !== 'USER' && userType !== 'ORGANIZATION_USER') ? userBranchId : null
      };

      const response = await customerService.getAllCustomers(filterParams)

      if (response.success) {
        setCustomers(response.data)
        setTotalItems(Number(response.total) || 0)
        setTotalPages(Number(response.pages) || 1)
        setCurrentPage(Number(response.page) || 1)
      } else {
        throw new Error(response.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load customers"
      })
    } finally {
      setIsLoading(false)
    }
  }, [userBranchId, userType, toast])

  const fetchCustomerTypes = useCallback(async () => {
    try {
      const response = await customerService.getCustomerTypes()

      if (response.success) {
        setCustomerTypes(response.data)
      } else {
        console.error('Failed to fetch customer types:', response.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load customer types"
        })
      }
    } catch (error) {
      console.error("Failed to fetch customer types:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load customer types"
      })
    }
  }, [toast])

  useEffect(() => {
    // Only fetch customers if we have user type
    // SUPERADMIN can fetch without branchId, others need branchId
    if (userType !== null) {
      if (userType === 'SUPERADMIN' || userType === 'USER' || userType === 'ORGANIZATION_USER' || userBranchId) {
        fetchCustomers(currentPage, pageSize, selectedCustomerType);
        fetchCustomerTypes();
      }
    }
  }, [fetchCustomers, currentPage, pageSize, selectedCustomerType, userBranchId, userType, fetchCustomerTypes])

  const handlePageChange = (newPage) => {
    setCurrentPage(Number(newPage))
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleCustomerTypeChange = (customerTypeName) => {
    console.log('Customer Type Changed:', customerTypeName)
    setSelectedCustomerType(customerTypeName)
    setCurrentPage(1) // Reset to first page when changing customer type
  }

  const handleSortFieldChange = (field) => {
    console.log('Sort Field Changed:', field)
    setSortConfig(current => ({
      ...current,
      field
    }))
  }

  const handleSortDirectionChange = (direction) => {
    console.log('Sort Direction Changed:', direction)
    setSortConfig(current => ({
      ...current,
      direction
    }))
  }

  return (
    <div className="container space-y-4">
      <CustomersTable
        customers={customers}
        customerTypes={customerTypes}
        selectedCustomerType={selectedCustomerType}
        onCustomerTypeChange={handleCustomerTypeChange}
        onRefresh={() => fetchCustomers(currentPage, pageSize, selectedCustomerType)}
        sortConfig={sortConfig}
        onSortFieldChange={handleSortFieldChange}
        onSortDirectionChange={handleSortDirectionChange}
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