"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { menuItemDiscountService } from "@/services/menu-item-discount.service"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { discountService } from "@/services/discount.service"
import { menuItemService } from "@/services/menu-item.service"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

// Helper function to safely parse numeric values
const parseNumeric = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const formSchema = z.object({
  discount_id: z.string().min(1, "Discount ID is required"),
  discount_name: z.string().min(1, "Discount name is required"),
  emc_code: z.string().optional(),

  // Optional fields
  description: z.string().optional(),
  start_date: z.union([z.string(), z.null()]).optional(),
  end_date: z.union([z.string(), z.null()]).optional(),
  expiry_date: z.union([z.string(), z.null()]).optional(),
  days: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),


  max_discount_amount: z.union([
    z.string().transform(val => parseNumeric(val)),
    z.number(),
    z.null()
  ]).optional(),
  min_order_value: z.union([
    z.string().transform(val => parseNumeric(val)),
    z.number(),
    z.null()
  ]).optional(),
  max_usage_per_customer: z.union([
    z.string().transform(val => parseNumeric(val) || 1),
    z.number().min(1, "Max usage per customer is required")
  ]),
  max_usage_count: z.union([
    z.string().transform(val => parseNumeric(val)),
    z.number(),
    z.null()
  ]).optional(),
  // countries: z.array(z.string()).min(1, "At least one country is required"),
  // brand: z.string().min(1, "Brand is required"),
  // branches: z.array(z.string()).min(1, "At least one branch is required"),
  // menu_items: z.array(z.string()).min(1, "At least one menu item is required"),
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
}).refine(data => {
  // Ensure either amount or percentage is provided, but not both
  const hasAmount = data.amount != null && data.amount > 0;
  const hasPercentage = data.percentage != null && data.percentage > 0;
  return (hasAmount && !hasPercentage) || (!hasAmount && hasPercentage);
}, {
  message: "Please provide either amount or percentage",
  path: ['amount', 'percentage']
});

export function EditMenuItemDiscountForm({
  open,
  onOpenChange,
  onSuccess,
  initialData
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  // const [countries, setCountries] = useState([])
  // const [brands, setBrands] = useState([])
  // const [branches, setBranches] = useState([])
  // const [menuItems, setMenuItems] = useState([])
  // const [selectedBrand, setSelectedBrand] = useState(null)
  const [discountType, setDiscountType] = useState('amount') // 'amount' or 'percentage'

  const daysList = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  // Initialize form with initial data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discount_id: "",
      discount_name: "",
      description: "",
      expiry_date: "",
      emc_code: "",
      start_date: "",
      end_date: "",
      amount: '',
      percentage: '',
      max_discount_amount: '',
      min_order_value: '',
      max_usage_per_customer: '',
      max_usage_count: '',
      days: [],
      is_active: true,
    },
    mode: "onChange"
  })

  // // Fetch initial data (countries and brands)
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     if (!open) return

  //     try {
  //       setIsLoadingData(true)
  //       const [countriesRes, brandsRes] = await Promise.all([
  //         discountService.getCountries(),
  //         discountService.getBrands()
  //       ])

  //       if (countriesRes?.data) {
  //         setCountries(countriesRes.data)
  //       }
  //       if (brandsRes?.data) {
  //         setBrands(brandsRes.data)

  //         // If we have initial brand data, fetch its related data
  //         if (initialData?.brands?.[0]?.brand_id) {
  //           const brandId = initialData.brands[0].brand_id.toString()
  //           setSelectedBrand(brandId)
  //           await handleBrandChange(brandId, true)
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch initial data:', error)
  //       toast({
  //         variant: "destructive",
  //         title: "Error",
  //         description: "Failed to load initial data"
  //       })
  //     } finally {
  //       setIsLoadingData(false)
  //     }
  //   }

  //   fetchInitialData()
  // }, [open, initialData])

  // // Modified handleBrandChange function
  // const handleBrandChange = useCallback(async (brandId, isInitial = false) => {
  //   try {
  //     setIsLoadingData(true)
  //     form.setValue('brand', brandId)
  //     setSelectedBrand(brandId)

  //     if (!isInitial) {
  //       // Only reset values if not initial load
  //       form.setValue('branches', [])
  //       form.setValue('menu_items', [])
  //     }

  //     // Fetch branches and menu items for the selected brand
  //     const [branchesRes, menuItemsRes] = await Promise.all([
  //       discountService.getBranches(1, 100, { brand: brandId }),
  //       menuItemDiscountService.getMenuItems(brandId)
  //     ])

  //     if (branchesRes?.data) {
  //       setBranches(branchesRes.data)

  //       // If initial load, set the selected branches
  //       if (isInitial && initialData?.branches?.length > 0) {
  //         const branchIds = initialData.branches.map(b => b.branch_id.toString())
  //         form.setValue('branches', branchIds)
  //       }
  //     }

  //     if (menuItemsRes?.data) {
  //       const formattedMenuItems = menuItemsRes.data.map(item => ({
  //         id: item.id.toString(),
  //         name: item.name || item.item_name,
  //         code: item.code || item.item_code,
  //         price: item.price || item.item_price || 0
  //       }))
  //       setMenuItems(formattedMenuItems)

  //       // If initial load, set the selected menu items
  //       if (isInitial && initialData?.menu_items?.length > 0) {
  //         const menuItemIds = initialData.menu_items.map(m => m.menu_item_id.toString())
  //         form.setValue('menu_items', menuItemIds)
  //       }
  //     }

  //   } catch (error) {
  //     console.error('Failed to process brand data:', error)
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Failed to process brand data"
  //     })
  //   } finally {
  //     setIsLoadingData(false)
  //   }
  // }, [form, initialData])

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      // Transform the data to match the API's expected format
      const formattedData = {
        discount_id: initialData.discount_id,
        discount_name: data.discount_name,
        description: data.description,
        expiry_date: data.expiry_date,
        emc_code: data.emc_code,

        start_date: data.start_date,
        end_date: data.end_date,
        max_discount_amount: data.max_discount_amount,
        min_order_value: data.min_order_value,
        max_usage_per_customer: data.max_usage_per_customer,
        max_usage_count: data.max_usage_count,

        discount_type: discountType,
        discount_value: discountType === 'amount' ? data.amount : data.percentage,
        days: data.days,
        is_active: data.is_active !== false,
        // countries: data.countries,
        // brands: [data.brand],
        // branches: data.branches,
        // menu_items: data.menu_items,
      }

      // Add either amount or percentage based on discountType
      console.log('Submitting update data:', formattedData)

      const response = await menuItemDiscountService.updateMenuItemDiscount(
        initialData.id,
        formattedData
      )

      if (response.success) {
        toast({
          title: "Success",
          description: "Menu item discount updated successfully"
        })
        onSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(response.message || 'Failed to update discount')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update menu item discount"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Initial data received:', initialData);

      // Determine the discount type and value
      const discountType = initialData.discount_type === 'percentage' ? 'percentage' : 'amount';
      const discountValue = initialData.discount_value || "";

      // Set the discount type state
      setDiscountType(discountType);

      // Prepare form values
      const formValues = {
        discount_id: initialData.discount_id || "",
        discount_name: initialData.discount_name || "",
        description: initialData.description || "",
        emc_code: initialData.emc_code || "",
        expiry_date: initialData.expiry_date
          ? formatDateForInput(initialData.expiry_date)
          : "",
        start_date: initialData.start_date
          ? formatDateForInput(initialData.start_date)
          : "",
        end_date: initialData.end_date
          ? formatDateForInput(initialData.end_date)
          : "",
        max_discount_amount: initialData.max_discount_amount || "",
        min_order_value: initialData.min_order_value || "",
        max_usage_per_customer: initialData.max_usage_per_customer || 1,
        max_usage_count: initialData.max_usage_count || "",
        days: Array.isArray(initialData.days) ? initialData.days : [],
        is_active: initialData.is_active ?? true,


        // Set the appropriate discount value field based on type
        [discountType]: discountValue.toString(),
        // Explicitly set the other field to empty to avoid conflicts
        [discountType === 'amount' ? 'percentage' : 'amount']: ""
      };

      console.log('Setting form values:', formValues);
      form.reset(formValues);
    }
  }, [initialData, form]);

  // Handle discount type change
  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    // Clear the other field when switching types
    if (type === 'amount') {
      form.setValue('percentage', '');
    } else {
      form.setValue('amount', '');
    }
  };

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Edit Menu Item Discount</DialogTitle>
          <DialogDescription>
            Make changes to your menu item discount here. Click update when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <FormField
                control={form.control}
                name="discount_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter discount ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="discount_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter discount name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emc_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EMC Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter EMC code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Countries</FormLabel>
                    <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                      {countries.map((country) => (
                        <div key={country.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            checked={field.value.includes(country.id.toString())}
                            onCheckedChange={(checked) => {
                              const values = [...field.value]
                              if (checked) {
                                values.push(country.id.toString())
                              } else {
                                const index = values.indexOf(country.id.toString())
                                if (index > -1) values.splice(index, 1)
                              }
                              field.onChange(values)
                            }}
                          />
                          <label className="text-sm flex-1">
                            {country.country_name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleBrandChange(value)
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isLoadingData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                          >
                            {brand.brand_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div> */}

            {/* {selectedBrand && (
              <>
                <FormField
                  control={form.control}
                  name="branches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branches</FormLabel>
                      <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                        {branches.map((branch) => (
                          <div key={branch.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={field.value.includes(branch.id.toString())}
                              onCheckedChange={(checked) => {
                                const values = [...field.value]
                                if (checked) {
                                  values.push(branch.id.toString())
                                } else {
                                  const index = values.indexOf(branch.id.toString())
                                  if (index > -1) values.splice(index, 1)
                                }
                                field.onChange(values)
                              }}
                            />
                            <label className="text-sm flex-1">
                              {branch.branch_name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="menu_items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Items</FormLabel>
                      <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                        {menuItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={field.value.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const values = [...field.value]
                                if (checked) {
                                  values.push(item.id)
                                } else {
                                  const index = values.indexOf(item.id)
                                  if (index > -1) values.splice(index, 1)
                                }
                                field.onChange(values)
                              }}
                            />
                            <label className="text-sm flex-1">
                              {item.name || item.code} ({item.code}) - ${item.price}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )} */}

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

            {/* min order value and max discount amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_order_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Order Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number" {...field} placeholder="Enter min order value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number" {...field} placeholder="Enter max discount amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* max usage per customer and max usage count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_usage_per_customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Usage Per Customer</FormLabel>
                    <FormControl>
                      <Input
                        type="number" {...field} placeholder="Enter max usage per customer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_usage_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Usage Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number" {...field} placeholder="Enter max usage count" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* start and end date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ''}
                        onChange={(e) => {
                          // Set to null if empty, otherwise use the value
                          const value = e.target.value ? e.target.value : null;
                          field.onChange(value);
                          console.log('Start date changed:', value);
                        }}
                        placeholder="Select start date (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ''}
                        onChange={(e) => {
                          // Set to null if empty, otherwise use the value
                          const value = e.target.value ? e.target.value : null;
                          field.onChange(value);
                          console.log('End date changed:', value);
                        }}
                        placeholder="Select end date (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value || ''}
                      onChange={(e) => {
                        // Set to null if empty, otherwise use the value
                        const value = e.target.value ? e.target.value : null;
                        field.onChange(value);
                        console.log('Expiry date changed:', value);
                      }}
                      placeholder="Select expiry date (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden">
              <AccordionItem value="days">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="text-left">
                    <h3 className="text-sm font-medium">Select Days</h3>
                    <p className="text-xs text-muted-foreground">
                      {/* {form.watch('days')
                                                ? `Expires on ${new Date(form.watch('days')).toLocaleDateString()}`
                                                : 'No day set'} */}
                      {Array.isArray(form.watch('days')) && form.watch('days').length > 0
                        ? `${form.watch('days').length} day(s) selected`
                        : 'No day selected'}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4">
                    <FormField
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex flex-wrap gap-2">
                              {daysList.map((day) => (
                                <label key={day} className="flex items-center space-x-2">
                                  <Input
                                    type="checkbox"
                                    {...field}
                                    value={day}
                                    checked={field.value?.includes(day) || false}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const currentValue = field.value || [];
                                      const newValue = checked
                                        ? [...currentValue, day]
                                        : currentValue.filter((d) => d !== day);
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <span>{day}</span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>


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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="ml-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Discount"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 