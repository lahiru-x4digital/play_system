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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { countryService } from "@/services/country.service"
import { brandService } from "@/services/brand.service"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { branchService } from "@/services/branch.service"
import { menuItemService } from "@/services/menu-item.service"
import { discountService } from "@/services/discount.service"
import { Loader2 } from "lucide-react"
import ReactSelect from "react-select"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

const formSchema = z.object({
  // discount_id: z.string().min(1, "Discount ID is required"),
  discount_name: z.string().min(1, "Discount name is required"),

  // Optional fields
  description: z.string().optional(),
  start_date: z.union([z.string(), z.null()]).optional(),
  end_date: z.union([z.string(), z.null()]).optional(),
  expiry_date: z.union([z.string(), z.null()]).optional(),
  max_discount_amount: z.string().optional(),
  min_order_value: z.string().optional(),
  max_usage_per_customer: z.string().min(1, "Max usage per customer is required"),
  // max_usage_per_customer: z.string().optional(),
  max_usage_count: z.string().optional(),
  emc_code: z.string().optional(),
  days: z.array(z.string()).optional(),

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

export function AddMenuItemDiscountForm({ open, onOpenChange, onSuccess }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [menuItems, setMenuItems] = useState([])
  const [menuItemSearchQuery, setMenuItemSearchQuery] = useState('')
  const [discountType, setDiscountType] = useState('amount') // 'amount' or 'percentage'

  const daysList = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discount_name: "",
      description: "",
      amount: '',
      percentage: '',
      min_order_value: '',
      max_discount_amount: '',
      start_date: null,
      end_date: null,
      expiry_date: null,
      max_usage_per_customer: '',
      max_usage_count: '',
      emc_code: '',
      days: [],
      // menu_items: [],
      is_active: true,

    },
    mode: "onChange"
  })

  // const filteredMenuItems = menuItems.filter(item => item.code.toLowerCase().includes(menuItemSearchQuery.toLowerCase()))

  // Handle discount type change
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value)
    // Clear both fields when switching
    form.setValue('amount', '')
    form.setValue('percentage', '')
  }
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      // Create a clean version of the data
      const formattedData = {
        discount_name: data.discount_name,
        description: data.description ? data.description : '',
        expiry_date: data.expiry_date ? data.expiry_date : null, // Explicitly set to null if empty
        min_order_value: data.min_order_value ? data.min_order_value : 0,
        max_discount_amount: data.max_discount_amount ? data.max_discount_amount : 0,
        start_date: data.start_date ? data.start_date : null,
        end_date: data.end_date ? data.end_date : null,
        max_usage_per_customer: data.max_usage_per_customer ? data.max_usage_per_customer : 1,
        max_usage_count: data.max_usage_count ? data.max_usage_count : 0,
        emc_code: data.emc_code ? data.emc_code : '',
        days: data.days,
        is_active: data.is_active === true,
      };


      // Add either amount or percentage based on discountType
      if (discountType === 'amount') {
        formattedData.amount = Number(data.amount)
      } else {
        formattedData.percentage = Number(data.percentage)
      }


      console.log('Form data being sent:', formattedData);

      await menuItemDiscountService.createMenuItemDiscount(formattedData)

      toast({
        title: "Success",
        description: "Menu item discount created successfully"
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create menu item discount"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Add Menu Item Discount</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Discount"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 