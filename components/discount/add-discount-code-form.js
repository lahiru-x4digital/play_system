"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { discountService } from "@/services/discount.service"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  MultiSelect,
  MultiSelectItem,
} from "@/components/ui/multi-select"
import {
  Badge,
  BadgeProps,
} from "@/components/ui/badge"
import { X } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string()
    .min(1, "Code is required")
    .max(10, "Code must be less than 10 characters")
    .regex(/^[A-Z0-9-]*$/, "Code can only contain uppercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required"),
  country: z.union([
    z.string().transform(val => Number(val)),
    z.number()
  ]).refine(val => val > 0, {
    message: "Please select a country"
  }),
  brands: z.array(z.string()).min(1, "At least one brand is required"),
  branches: z.array(z.string()).min(1, "At least one branch is required"),
  amount: z.union([
    z.string().transform(val => Number(val)),
    z.number(),
    z.null()
  ]).optional(),
  percentage: z.union([
    z.string().transform(val => Number(val)),
    z.number(),
    z.null()
  ]).optional(),
  limit_per_customer: z.number().min(1, "Limit per customer is required"),
  expire_date: z.string().min(1, "Expiry date is required"),
  is_active: z.boolean().default(true),
  // is_Bulk: z.boolean().default(false),
  emc_code: z.string().optional(),
}).refine(data => {
  // Ensure either amount or percentage is provided, but not both
  const hasAmount = data.amount != null && data.amount > 0;
  const hasPercentage = data.percentage != null && data.percentage > 0;
  return (hasAmount && !hasPercentage) || (!hasAmount && hasPercentage);
}, {
  message: "Please provide either amount or percentage",
  path: ['amount', 'percentage']
});

export function AddDiscountCodeForm({
  open,
  onOpenChange,
  onSubmit,
  initialData = null
}) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [countries, setCountries] = useState([])
  const [brands, setBrands] = useState([])
  const [branches, setBranches] = useState([])
  const [discountType, setDiscountType] = useState('amount') // 'amount' or 'percentage'
  const [draftData, setDraftData] = useState(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      country: '',
      brands: [],
      branches: [],
      amount: '',
      percentage: '',
      limit_per_customer: 1,
      expire_date: '',
      is_active: true,
      // is_Bulk: false,
      emc_code: '',
    },
    mode: "onChange",
  })

  // Load draft data when opening the form
  useEffect(() => {
    if (open && draftData) {
      form.reset(draftData)
      setBrands(draftData.brands || [])
    }
  }, [open, draftData, form])

  // Add defaultValues constant
  const defaultValues = {
    name: "",
    code: "",
    description: "",
    country: "",
    brands: [],
    branches: [],
    amount: null,
    percentage: null,
    limit_per_customer: 1,
    expire_date: "",
    is_active: true,
    // is_Bulk: false,
    emc_code: '',
  }

  // Update the clearForm function
  const clearForm = useCallback(() => {
    form.reset(defaultValues)
    setDraftData(null)
  }, [form])

  // Update the saveAsDraft function
  const saveAsDraft = useCallback(() => {
    const currentValues = form.getValues()
    setDraftData(currentValues)
    onOpenChange(false)
    toast({
      title: "Draft Saved",
      description: "Your discount code form has been saved as draft",
    })
  }, [form, onOpenChange])

  // Handle discount type change
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value)
    // Clear both fields when switching
    form.setValue('amount', '')
    form.setValue('percentage', '')
  }

  // Update the handleDialogClose function
  const handleDialogClose = useCallback(() => {
    clearForm() // Always clear form on cancel
    onOpenChange(false)
  }, [clearForm, onOpenChange])

  const handleFormSubmit = async (data) => {
    try {
      setIsLoading(true)

      // Format the data according to API requirements
      const formattedData = {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
        country: Number(data.country),
        brands: data.brands.map(Number),
        branches: data.branches.map(Number),
        limit_per_customer: Number(data.limit_per_customer),
        expire_date: new Date(data.expire_date).toISOString(),
        is_active: data.is_active,
        // is_Bulk: data.is_Bulk,
        emc_code: data.emc_code,
      }

      // Add either amount or percentage based on discountType
      if (discountType === 'amount') {
        formattedData.amount = Number(data.amount)
      } else {
        formattedData.percentage = Number(data.percentage)
      }

      // Remove any undefined or null values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key]
        }
      })

      console.log('Final formatted data:', formattedData)
      await onSubmit(formattedData)

      clearForm()
      onOpenChange(false)
      toast({
        title: "Success",
        description: "Discount code created successfully"
      })

    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create discount code"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data for dropdowns
  useEffect(() => {
    async function fetchData() {
      if (!open) return

      try {
        setIsLoadingData(true)
        const [countriesRes, brandsRes, branchesRes] = await Promise.all([
          discountService.getCountries(),
          discountService.getBrands(),
          discountService.getBranches(),
        ])

        if (countriesRes?.data) setCountries(countriesRes.data)
        if (brandsRes?.data) setBrands(brandsRes.data)
        if (branchesRes?.data) setBranches(branchesRes.data)
      } catch (error) {
        console.error('Failed to fetch form data:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load form data",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [open, toast])

  const renderSelectContent = (items, loading, type) => {
    if (loading) {
      return (
        <SelectItem value="loading" disabled>
          Loading...
        </SelectItem>
      )
    }

    if (!items || items.length === 0) {
      return (
        <SelectItem value="no-data" disabled>
          No items available
        </SelectItem>
      )
    }

    switch (type) {
      case 'country':
        return items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.country_name}
          </SelectItem>
        ))
      case 'brand':
        return items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.brand_name || item.name}
          </SelectItem>
        ))
      case 'branch':
        return items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.branch_name || item.name}
          </SelectItem>
        ))
      default:
        return items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl sm:text-2xl">Add New Discount Code</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {/* Basic Information - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="uppercase w-full"
                        placeholder="Enter code"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="Enter name"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter description"
                      className="resize-none min-h-[80px] w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emc_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">EMC Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter EMC code"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            {/* Location Settings - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Country</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value ? field.value.toString() : undefined}
                      disabled={isLoadingData}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingData ? "Loading..." : "Select country"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingData ? (
                          <SelectItem value="loading" disabled>
                            Loading countries...
                          </SelectItem>
                        ) : countries && countries.length > 0 ? (
                          countries.map((country) => (
                            <SelectItem
                              key={country.id}
                              value={country.id.toString()}
                            >
                              {country.country_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            No countries available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brands"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Brands</FormLabel>
                    <FormControl>
                      <MultiSelect
                        value={
                          // Convert IDs to names for display
                          field.value?.map(id => {
                            const brand = brands.find(b => String(b.id) === String(id));
                            return brand?.brand_name || '';
                          }) || []
                        }
                        onValueChange={(selectedNames) => {
                          // Convert selected names to IDs for form state
                          const selectedValues = Array.isArray(selectedNames) ? selectedNames : [selectedNames];
                          const brandIds = selectedValues
                            .map(name => {
                              const brand = brands.find(b => b.brand_name === name);
                              return brand ? String(brand.id) : null;
                            })
                            .filter(Boolean);
                          field.onChange(brandIds);
                        }}
                        placeholder="Select brands"
                      >
                        {(brands || []).map((brand) => (
                          <MultiSelectItem
                            key={brand.id}
                            value={brand.brand_name}
                          >
                            {brand.brand_name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelect>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Branches</FormLabel>
                    <FormControl>
                      <MultiSelect
                        value={
                          // Convert IDs to names for display
                          field.value?.map(id => {
                            const branch = branches.find(b => String(b.id) === String(id));
                            return branch?.branch_name || '';
                          }) || []
                        }
                        onValueChange={(selectedNames) => {
                          // Convert selected names to IDs for form state
                          const selectedValues = Array.isArray(selectedNames) ? selectedNames : [selectedNames];
                          const branchIds = selectedValues
                            .map(name => {
                              const branch = branches.find(b => b.branch_name === name);
                              return branch ? String(branch.id) : null;
                            })
                            .filter(Boolean);
                          field.onChange(branchIds);
                        }}
                        placeholder="Select branches"
                      >
                        {(branches || []).map((branch) => (
                          <MultiSelectItem
                            key={branch.id}
                            value={branch.branch_name}
                          >
                            {branch.branch_name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelect>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Combined Discount Field */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name={discountType === 'amount' ? 'amount' : 'percentage'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Discount Value</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        value={discountType}
                        onValueChange={handleDiscountTypeChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="amount">Amount ($)</SelectItem>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          placeholder={discountType === 'amount' ? "Enter amount" : "Enter percentage"}
                          className="w-full"
                          min={0}
                          max={discountType === 'percentage' ? 100 : undefined}
                          step={discountType === 'percentage' ? 1 : 0.01}
                        />
                      </FormControl>
                    </div>
                    <FormDescription className="text-xs">
                      {discountType === 'amount'
                        ? 'Fixed amount discount in dollars'
                        : 'Percentage discount (0-100)'
                      }
                    </FormDescription>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Discount Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="limit_per_customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Limit Per Customer</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        value={field.value || '1'}
                        placeholder="Enter limit"
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Maximum number of times a customer can use this code
                    </FormDescription>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      When this discount code will expire
                    </FormDescription>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Active State */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm sm:text-base">Active State</FormLabel>
                    <FormDescription className="text-xs">
                      Enable or disable this discount code
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="is_Bulk"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm sm:text-base">Quantity</FormLabel>
                    <FormDescription className="text-xs">
                      Enable or disable bulk creation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={saveAsDraft}
                  className="w-full sm:w-auto"
                >
                  Save & Close
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Discount Code'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 