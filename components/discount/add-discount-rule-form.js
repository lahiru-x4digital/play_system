"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { discountService } from "@/services/discount.service"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { LocationSelector } from "../common/LocationSelector"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import MultisectLocation from "../common/MultisectLocation"
import MultisectBrandInput from "../common/MultisectBrandInput"
import MultisectBranchInput from "../common/MultisectBranchInput"
import { ChevronsUpDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rule_Id: z.string().min(1, "Rule ID is required"),
  description: z.string().optional().nullable(),
  emc_code: z.string().min(1, "EMC code is required"),
  discount_type: z.string({
    required_error: "Discount type is required",
    invalid_type_error: "Please select a valid discount type"
  }).refine(
    val => val === 'AMOUNT' || val === 'PRECENTAGE',
    {
      message: "Discount type is required",
      path: ["discount_type"]
    }
  ),
  amount: z.union([
    z.string().min(1, "Amount is required when discount type is Amount"),
    z.number().min(0.01, "Amount must be greater than 0"),
    z.null()
  ]).optional().transform(val => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
  }),
  precentage: z.union([
    z.string().min(1, "Percentage is required when discount type is Percentage"),
    z.number().min(0.01, "Percentage must be greater than 0"),
    z.null()
  ]).optional().transform(val => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return num > 100 ? 100 : num; // Ensure percentage doesn't exceed 100
  }),
  expiry_date: z.string().optional().nullable(),
  days_of_week: z.array(z.string()).default([]),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  limitation: z.boolean().default(false),
  one_time: z.boolean().default(false),
  cooldown_period: z.string().nullable().default(null),
  max_uses: z.union([
    z.string(),
    z.number()
  ]).nullable().default(null).transform(val => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
  }),
  is_active: z.boolean().default(true),

  countries: z.array(z.string()).default([]),
  brands: z.array(z.string()).default([]),
  branches: z.array(z.string()).default([]),
  discount_rule_type: z.enum(['INTERNAL', 'CUSTOMER']),

})
  .refine(
    (data) => {
      if (data.limitation && !data.one_time) {
        return !!(data.max_uses !== null && data.cooldown_period !== null);
      }
      return true;
    },
    {
      message: "Both max uses and cooldown period are required when limitation is enabled and one_time is false",
      path: ["limitation"]
    }
  )
  .refine(
    (data) => {
      if (data.discount_type === 'AMOUNT') {
        return data.amount !== null && data.amount !== '' && data.amount !== undefined;
      } else if (data.discount_type === 'PRECENTAGE') {
        return data.precentage !== null && data.precentage !== '' && data.precentage !== undefined;
      }
      return false;
    },
    {
      message: "Amount or Percentage is required based on discount type",
      path: ["amount"]
    }
  )

export function AddDiscountRuleForm({ onSuccess, initialData = null, onClose, open: controlledOpen, onOpenChange }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)

  const [open, setOpen] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      rule_Id: initialData?.rule_Id || "",
      description: initialData?.description || "",
      emc_code: initialData?.emc_code || "",
      discount_type: null, // No default value - makes it required
      amount: initialData?.amount ? initialData.amount.toString() : null,
      precentage: initialData?.precentage ? initialData.precentage.toString() : null,
      expiry_date: initialData?.expiry_date ? new Date(initialData.expiry_date).toISOString().slice(0, 16) : "",
      days_of_week: initialData?.days_of_week || [],
      start_time: initialData?.start_time || "",
      end_time: initialData?.end_time || "",
      cooldown_period: initialData?.cooldown_period || null,
      cooldown_value: initialData?.cooldown_period ? parseInt(initialData.cooldown_period.match(/\d+/) || '0') : null,
      cooldown_unit: initialData?.cooldown_period
        ? initialData.cooldown_period.startsWith('PT')
          ? initialData.cooldown_period.includes('H') ? 'HOURS' : 'MINUTES'
          : initialData.cooldown_period.startsWith('P')
            ? initialData.cooldown_period.includes('D') ? 'DAYS'
              : initialData.cooldown_period.includes('M') ? 'MONTHS'
                : 'YEARS'
            : 'HOURS'
        : 'HOURS',
      limitation: initialData?.limitation || false,
      max_uses: initialData?.max_uses?.toString() || "1",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
      countries: initialData?.countries || [],
      brands: initialData?.brands || [],
      branches: initialData?.branches || [],
      discount_rule_type: initialData?.discount_rule_type
    },
  })

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : open


  // Watch limitation toggle and reset values accordingly
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'limitation') {
        if (!value.limitation) {
          // Reset values when limitation is turned off
          form.setValue('max_uses', null, { shouldValidate: true })
          form.setValue('cooldown_value', null, { shouldValidate: true })
          form.setValue('cooldown_period', null, { shouldValidate: true })
        } else {
          // Set default values when limitation is turned on
          form.setValue('max_uses', 1, { shouldValidate: true })
          form.setValue('cooldown_value', 1, { shouldValidate: true })
          // cooldown_period will be set by the cooldown effect
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Watch cooldown value and unit to update cooldown_period
  const cooldownValue = form.watch('cooldown_value')
  const cooldownUnit = form.watch('cooldown_unit')
  const limitation = form.watch('limitation')

  useEffect(() => {
    // Only update cooldown_period if limitation is enabled
    if (!limitation) {
      form.setValue('cooldown_period', null, { shouldValidate: true });
      return;
    }

    if (cooldownValue > 0 && cooldownUnit) {
      let period = '';
      switch (cooldownUnit) {
        case 'MINUTES':
          period = `PT${cooldownValue}M`;
          break;
        case 'HOURS':
          period = `PT${cooldownValue}H`;
          break;
        case 'DAYS':
          period = `P${cooldownValue}D`;
          break;
        case 'MONTHS':
          period = `P${cooldownValue}M`;
          break;
        case 'YEARS':
          period = `P${cooldownValue}Y`;
          break;
        default:
          period = `PT${cooldownValue}H`;
      }
      form.setValue('cooldown_period', period, { shouldValidate: true })
    } else {
      form.setValue('cooldown_period', null, { shouldValidate: true })
    }
  }, [cooldownValue, cooldownUnit, limitation, form])

  // Watch discount type
  const discountType = form.watch('discount_type')
  console.log(form.formState.errors)
  // Handle discount type change
  const handleDiscountTypeChange = (value) => {
    form.setValue('discount_type', value)
    // Clear the other field when switching types
    if (value === 'AMOUNT') {
      form.setValue('precentage', null)
    } else if (value === 'PRECENTAGE') {
      form.setValue('amount', null)
    }
  }

  // Handle one_time change
  const handleOneTimeChange = (checked) => {
    form.setValue('one_time', checked)
    if (checked) {
      // If one_time is true, set max_uses to 1 and clear cooldown
      form.setValue('max_uses', 1)
      form.setValue('cooldown_value', null)
      form.setValue('cooldown_period', null)
    } else {
      // If one_time is false, reset to default values
      form.setValue('max_uses', 1)
      form.setValue('cooldown_value', 1)
      form.setValue('cooldown_unit', 'DAYS')
    }
  }

  // Handle max_uses or cooldown changes to ensure one_time is false
  const handleUsageLimitChange = (field, value) => {
    if (field === 'max_uses' || field === 'cooldown_value' || field === 'cooldown_unit') {
      if ((field === 'max_uses' && value > 1) || 
          (field === 'cooldown_value' && value > 0) ||
          (field === 'cooldown_unit' && value)) {
        form.setValue('one_time', false)
      }
    }
    // Update the actual field value
    form.setValue(field, value)
  }

  console.log("country", form.watch('countries'))
  const onSubmit = async (data) => {
    try {
      console.log('[Discount Form] Form submission started with one_time value:', data.one_time);
      console.log('[Discount Form] Full form data:', JSON.stringify(data, null, 2));

      const locationAccordionOpen = document.querySelector('#location-accordion [data-state="open"]');

      const validationResult = await form.trigger();

      if (!validationResult) {

        throw new Error('Please fix the form errors before submitting');
      }

      setIsSubmitting(true);

      // Prepare the base payload with correct field names
      const payload = {
        name: data.name,
        rule_code: data.rule_Id,
        description: data.description,
        emc_code: data.emc_code,
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
        days_of_week: data.days_of_week || [],
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        create_date: new Date().toISOString(),
        cooldown_period: data.cooldown_period || null,
        limitation: Boolean(data.limitation),
        one_time: Boolean(data.one_time),
        max_uses: data.max_uses ? Number(data.max_uses) : null,
        is_active: Boolean(data.is_active),
        brands: data.brands,
        branches: data.branches,
        countries: data.countries,
        discount_rule_type: data.discount_rule_type
      };
      
      console.log('[Discount Form] Payload with one_time:', JSON.stringify(payload, null, 2));




      // Handle discount type and value
      if (data.discount_type === 'AMOUNT') {
        payload.amount = Number(data.amount);
        console.log('Setting amount:', payload.amount);
      } else if (data.discount_type === 'PRECENTAGE') {
        payload.percentage = Number(data.precentage);
        console.log('Setting percentage:', payload.percentage);
      } else {
        console.warn('No valid discount type selected');
      }



      const response = await discountService.createDiscountRule(payload);


      if (!response.success) {
        const errorMsg = response.message || 'Failed to create discount rule';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      toast({
        title: "Success",
        description: "Discount rule created successfully",
      });

      onSuccess?.();
      handleOpenChange(false);

    } catch (error) {
      console.error('Error in onSubmit:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create discount rule",
      });
    } finally {
      setIsSubmitting(false);
    }
  }



  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      form.reset({
        name: "",
        rule_Id: "",
        description: "",
        emc_code: "",
        discount_type: null,
        amount: null,
        precentage: null,
        expiry_date: "",
        days_of_week: [],
        start_time: "",
        end_time: "",
        cooldown_period: "",
        cooldown_value: 1,
        cooldown_unit: "HOURS",
        limitation: false,
        max_uses: null,
        is_active: true,
        brands: [],
        branches: [],
        countries: []
      });
    }

    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setOpen(newOpen)
    }
  }

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
      case 'brand':
        return items.map((item) => (
          <SelectItem key={item._id} value={item._id}>
            {item.brand_name || item.name}
          </SelectItem>
        ))
      case 'branch':
        return items.map((item) => (
          <SelectItem key={item._id} value={item._id}>
            {item.branch_name || item.name}
          </SelectItem>
        ))
      default:
        return items.map((item) => (
          <SelectItem key={item._id} value={item._id}>
            {item.name}
          </SelectItem>
        ))
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>Add New Rule</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-[95vw] w-full md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Add New Discount Rule</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Basic Information Section */}
            <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden" defaultValue="basic-info">
              <AccordionItem value="basic-info">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="text-left">
                    <h3 className="text-sm font-medium">Basic Information</h3>
                    <p className="text-xs text-muted-foreground">
                      Enter the basic details of the discount rule
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rule_Id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rule ID*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emc_code"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>EMC Code*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter EMC code" {...field} />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[50px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount_rule_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Rule Type*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INTERNAL">Internal</SelectItem>
                              <SelectItem value="CUSTOMER">Customer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Discount Settings */}
            <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden" defaultValue="discount-settings">
              <AccordionItem value="discount-settings">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="text-left">
                    <h3 className="text-sm font-medium">Discount Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      Configure the discount type and value
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="discount_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Discount Type*</FormLabel>
                            <Select
                              onValueChange={handleDiscountTypeChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AMOUNT">Amount</SelectItem>
                                <SelectItem value="PRECENTAGE">Precentage (%)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {discountType === 'AMOUNT' ? (
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Amount*</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    value={field.value ?? ''}
                                    onWheel={(e) => e.target.blur()}
                                    className={`w-full pr-8 ${form.formState.errors.amount && 'border-red-500'}`}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    $
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="precentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Percentage (%)*</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...field}
                                    value={field.value ?? ''}
                                    onWheel={(e) => e.target.blur()}
                                    className={`w-full pr-8 ${form.formState.errors.precentage && 'border-red-500'}`}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    %
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Usage Limits Section */}
            <div className="w-full border rounded-lg overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="enable-limitation"
                    checked={limitation}
                    onCheckedChange={(checked) => {
                      form.setValue('limitation', checked)
                      if (!checked) {
                        form.setValue('max_uses', null)
                        form.setValue('one_time', false)
                      }
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-medium">Usage Limits</h3>
                    <p className="text-xs text-muted-foreground">
                      {limitation
                        ? form.watch('max_usage')
                          ? `Max ${form.watch('max_usage')} use${form.watch('max_usage') === 1 ? '' : 's'}`
                            : 'Usage limit enabled'
                        : 'Usage limit disabled'}
                    </p>
                  </div>
                </div>
                {limitation && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="one-time"
                        checked={form.watch('one_time')}
                        onCheckedChange={handleOneTimeChange}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor="one-time"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        One Time Use
                      </label>
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newValue = !limitation
                    form.setValue('limitation', newValue)
                    if (!newValue) {
                      form.setValue('max_uses', null)
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground p-2 h-8 w-8"
                >
                  {limitation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {limitation && (
                <div className="pt-2 px-4 pb-4 space-y-4">
                  {!form.watch('one_time') ? (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        <FormField
                          control={form.control}
                          name="max_uses"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Maximum Uses</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => handleUsageLimitChange('max_uses', parseInt(e.target.value) || 1)}
                                  className="w-full"
                                  disabled={form.watch('one_time')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cooldown_value"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Per Time Period</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => handleUsageLimitChange('cooldown_value', parseInt(e.target.value) || 1)}
                                  className="w-full"
                                  disabled={form.watch('one_time')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cooldown_unit"
                          render={({ field }) => (
                            <FormItem className="w-[140px]">
                              <FormLabel className="invisible sm:visible">&nbsp;</FormLabel>
                              <Select
                                onValueChange={(value) => handleUsageLimitChange('cooldown_unit', value)}
                                value={field.value}
                                disabled={form.watch('one_time')}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MINUTES">Minute(s)</SelectItem>
                                  <SelectItem value="HOURS">Hour(s)</SelectItem>
                                  <SelectItem value="DAYS">Day(s)</SelectItem>
                                  <SelectItem value="MONTHS">Month(s)</SelectItem>
                                  <SelectItem value="YEARS">Year(s)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customers can use this discount {form.watch('max_uses') || 1} time{form.watch('max_uses') != 1 ? 's' : ''} per {form.watch('cooldown_value') || 1} {form.watch('cooldown_unit')?.toLowerCase().replace('s', '')}{form.watch('cooldown_value') != 1 ? 's' : ''}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      This discount can only be used once per customer.
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Date & Time Settings */}
            <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden">
              <AccordionItem value="datetime">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="text-left">
                    <h3 className="text-sm font-medium">Date & Time Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      {form.watch('days_of_week')?.length > 0 || form.watch('start_time') || form.watch('end_time') || form.watch('expiry_date')
                        ? 'Custom schedule configured'
                        : 'No schedule restrictions'}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 space-y-6">
                    
                    {/* Legacy Expiry Date */}
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">Legacy Expiry Date</FormLabel>
                      <FormField
                        control={form.control}
                        name="expiry_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="date"
                                  {...field}
                                  value={field.value ? field.value.split('T')[0] : ''}
                                  onChange={(e) => {
                                    field.onChange(e.target.value ? `${e.target.value}T00:00:00` : null)
                                  }}
                                  min={format(new Date(), 'yyyy-MM-dd')}
                                  className="flex-1"
                                />
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange(null)}
                                    className="shrink-0"
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Days of Week */}
                    <div className="space-y-3">
                      <FormLabel className="text-sm font-medium">Days of Week</FormLabel>
                      <FormField
                        control={form.control}
                        name="days_of_week"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  { value: 'MONDAY', label: 'Monday' },
                                  { value: 'TUESDAY', label: 'Tuesday' },
                                  { value: 'WEDNESDAY', label: 'Wednesday' },
                                  { value: 'THURSDAY', label: 'Thursday' },
                                  { value: 'FRIDAY', label: 'Friday' },
                                  { value: 'SATURDAY', label: 'Saturday' },
                                  { value: 'SUNDAY', label: 'Sunday' }
                                ].map((day) => (
                                  <div key={day.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={day.value}
                                      checked={field.value?.includes(day.value) || false}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        if (checked) {
                                          field.onChange([...currentValue, day.value]);
                                        } else {
                                          field.onChange(currentValue.filter(d => d !== day.value));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={day.value} 
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {day.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">Start Time</FormLabel>
                        <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="time"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value || null)}
                                    className="flex-1"
                                  />
                                  {field.value && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.onChange(null)}
                                      className="shrink-0"
                                    >
                                      Clear
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">End Time</FormLabel>
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="time"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value || null)}
                                    className="flex-1"
                                  />
                                  {field.value && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.onChange(null)}
                                      className="shrink-0"
                                    >
                                      Clear
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Location */}

            <Collapsible
              open={isLocationOpen}

              className="flex flex-col gap-2"
            >
              <div onClick={() => setIsLocationOpen(!isLocationOpen)} className="flex items-center justify-between gap-4 px-4 cursor-pointer border">
                <h4 className="text-sm font-semibold">
                  Location
                </h4>
                <p className="text-xs text-muted-foreground">
                  {"Click here to add locations"}
                </p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <ChevronsUpDown />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="flex flex-col gap-2">
                <MultisectLocation control={form.control} name="countries"
                />
                <MultisectBrandInput control={form.control} name="brands"
                />
                <MultisectBranchInput control={form.control} name="branches"
                />
              </CollapsibleContent>
            </Collapsible>
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

            {/* Footer */}
            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData ? 'Update' : 'Create'} Rule
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 