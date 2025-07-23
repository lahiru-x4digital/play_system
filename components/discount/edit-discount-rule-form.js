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
import MultisectBranchInput from "../common/MultisectBranchInput"
import MultisectBrandInput from "../common/MultisectBrandInput"
import MultisectLocation from "../common/MultisectLocation"
import { ChevronsUpDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rule_code: z.string().min(1, "Rule ID is required"),
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
  percentage: z.union([
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
  cooldown_period: z.string().nullable().default(null),
  max_uses: z.union([
    z.string(),
    z.number()
  ]).nullable().default(null).transform(val => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
  }),
  is_active: z.boolean().default(true),
 brands: z.array(z.string()).default([]).optional(),
   branches: z.array(z.string()).default([]).optional(),
   countries: z.array(z.string()).default([]).optional(),
   lastRemovedBrand: z.string().optional(),
   lastRemovedCountry: z.string().optional(),
   discount_rule_type: z.enum(['INTERNAL', 'CUSTOMER']),
}) 

.refine(
  (data) => {
    if (data.limitation) {
      return !!(data.max_uses !== null && data.cooldown_period !== null);
    }
    return true;
  },
  {
    message: "Both max uses and cooldown period are required when limitation is enabled",
    path: ["limitation"]
  }
)
.refine(
  (data) => {
    if (data.discount_type === 'AMOUNT') {
      return data.amount !== null && data.amount !== '' && data.amount !== undefined;
    } else if (data.discount_type === 'PRECENTAGE') {
      return data.percentage !== null && data.percentage !== '' && data.percentage !== undefined;
    }
    return false;
  },
  {
    message: "Amount or Percentage is required based on discount type",
    path: ["amount"]
  }
)

export function EditDiscountRuleForm({ rule, onSuccess, onClose, isOpen: controlledOpen, onOpenChange }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(controlledOpen || false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rule?.name || "",
      rule_code: rule?.rule_code || "",
      description: rule?.description || "",
      emc_code: rule?.emc_code || "",
      discount_type: rule?.amount !== null && rule?.amount !== undefined ? 'AMOUNT' : 'PRECENTAGE',
      amount: rule?.amount !== null && rule?.amount !== undefined ? rule.amount.toString() : null,
      percentage: rule?.amount !== null && rule?.amount !== undefined ? null : rule?.percentage?.toString() || "",
      expiry_date: rule?.expiry_date ? new Date(rule.expiry_date).toISOString().slice(0, 16) : "",
      days_of_week: rule?.days_of_week || [],
      start_time: rule?.start_time || "",
      end_time: rule?.end_time || "",
      cooldown_period: rule?.cooldown_period || null,
      cooldown_value: rule?.cooldown_period ? parseInt(rule.cooldown_period.match(/\d+/) || '0') : 1,
      cooldown_unit: rule?.cooldown_period
        ? rule.cooldown_period.startsWith('PT')
          ? rule.cooldown_period.includes('H') ? 'HOURS' : 'MINUTES'
          : rule.cooldown_period.startsWith('P')
            ? rule.cooldown_period.includes('D') ? 'DAYS'
              : rule.cooldown_period.includes('M') ? 'MONTHS'
                : 'YEARS'
            : 'HOURS'
        : 'HOURS',
      limitation: rule?.limitation || false,
      max_uses: rule?.max_uses?.toString() || "1",
      is_active: rule?.is_active !== undefined ? rule.is_active : true,
      brands: Array.isArray(rule?.brands)
        ? rule.brands.map(b => String(b.brand?.id || b))
        : rule?.brands ? [String(rule.brands.brand?.id || rule.brands)] : [],
      branches: Array.isArray(rule?.branches)
        ? rule.branches.map(b => String(b.branch?.id || b))
        : rule?.branches ? [String(rule.branches.branch?.id || rule.branches)] : [],
        countries: Array.isArray(rule?.countries)
        ? rule.countries.map(c => String(c.country_id))
        : rule?.countries ? [String(rule.countries.country_id)] : [],
        discount_rule_type: rule.discount_rule_type,
    },
  })
  const limitation = form.watch('limitation')
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : open
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'limitation' || (type === 'change' && name === undefined)) {
        if (!value.limitation) {
          form.setValue('max_uses', null, { shouldValidate: true })
          form.setValue('cooldown_value', null, { shouldValidate: true })
          form.setValue('cooldown_period', null, { shouldValidate: true })
        } else {
          form.setValue('max_uses', '1', { shouldValidate: true })
          form.setValue('cooldown_value', '1', { shouldValidate: true })
        }
      }
    })
   
    return () => {
      subscription.unsubscribe()
    }
  }, [form])

  useEffect(() => {
    if (isOpen) {
      // When dialog opens, set based on countries
      setIsLocationOpen(rule?.countries?.length > 0);
    } else {
      // When dialog closes, reset to false
      setIsLocationOpen(false);
    }
  }, [isOpen, rule?.countries?.length]);

  useEffect(() => {
    if (rule && Object.keys(rule).length > 0) {
      const isAmount = rule.amount !== null && rule.amount !== undefined;
      const initialDiscountType = isAmount ? 'AMOUNT' : 'PRECENTAGE';
      const initialDiscountValue = isAmount ? rule.amount : rule.percentage || '';

      const formattedBrands = rule.brands ? rule.brands.map(b => String(b.brand?.id || b)) : [];
      const formattedBranches = rule.branches ? rule.branches.map(b => String(b.branch?.id || b)) : [];
      const formattedCountries = rule.countries ? rule.countries.map(c => String(c.country_id)) : [];
      const formValues = {
        name: rule.name || '',
        rule_code: rule.rule_code || '',
        description: rule.description || '',
        emc_code: rule.emc_code || '',
        discount_type: initialDiscountType,
        amount: isAmount ? String(initialDiscountValue) : null,
        percentage: !isAmount && initialDiscountValue !== null ? String(initialDiscountValue) : null,
        expiry_date: rule.expiry_date ? new Date(rule.expiry_date).toISOString().slice(0, 16) : "",
        start_date: rule.start_date ? new Date(rule.start_date).toISOString().slice(0, 10) : "",
        end_date: rule.end_date ? new Date(rule.end_date).toISOString().slice(0, 10) : "",
        days_of_week: rule.days_of_week || [],
        start_time: rule.start_time || "",
        end_time: rule.end_time || "",
        cooldown_period: rule.cooldown_period || null,
        cooldown_value: rule.cooldown_period ? parseInt(rule.cooldown_period.match(/\d+/) || '0') : 1,
        cooldown_unit: rule.cooldown_period
          ? rule.cooldown_period.startsWith('PT')
            ? rule.cooldown_period.includes('H') ? 'HOURS' : 'MINUTES'
            : rule.cooldown_period.startsWith('P')
              ? rule.cooldown_period.includes('D') ? 'DAYS'
                : rule.cooldown_period.includes('M') ? 'MONTHS'
                  : 'YEARS'
              : 'HOURS'
          : 'HOURS',
        limitation: Boolean(rule.limitation),
        max_uses: rule.max_uses ? String(rule.max_uses) : '1',
        is_active: rule.is_active !== undefined ? rule.is_active : true,
        brands: formattedBrands,
        branches: formattedBranches,
        countries: formattedCountries,
        discount_rule_type: rule.discount_rule_type,
      };

      form.reset(formValues);
    }
  }, [rule, form])
  
  const cooldownValue = form.watch('cooldown_value')
  const cooldownUnit = form.watch('cooldown_unit')

  useEffect(() => {
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

  const discountType = form.watch('discount_type')

  const handleDiscountTypeChange = (value) => {
    form.setValue('discount_type', value)

    if (value === 'AMOUNT') {
      form.setValue('percentage', null)
      if (!form.getValues('amount')) {
        form.setValue('amount', '')
      }
    } else {
      form.setValue('amount', null)
      if (!form.getValues('percentage')) {
        form.setValue('percentage', '')
      }
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      // Only validate location if the accordion is open
      const locationAccordionOpen = document.querySelector('#location-accordion [data-state="open"]');
      
     

      // Ensure limitation is properly set as boolean
      data.limitation = Boolean(data.limitation);

      // If limitation is disabled, ensure related fields are null
      if (!data.limitation) {
        data.max_uses = null;
        data.cooldown_period = null;
        data.cooldown_value = null;
        data.cooldown_unit = 'HOURS';
      } else {
        // If limitation is enabled, ensure we have valid values
        data.max_uses = Number(data.max_uses) || 1;
        data.cooldown_period = data.cooldown_period || 'PT1H';
        data.cooldown_value = Number(data.cooldown_value) || 1;
      }

      const isValid = await form.trigger()

      if (!isValid) {
        throw new Error('Please fix the form errors before submitting');
      }

      const payload = {
        name: data.name,
        rule_code: data.rule_code,
        description: data.description,
        emc_code: data.emc_code,
        is_active: data.is_active,
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
        days_of_week: data.days_of_week || [],
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        limitation: data.limitation,
        max_uses: data.limitation ? Number(data.max_uses) : null,
        cooldown_period: data.limitation ? data.cooldown_period : null,
        discount_type: data.discount_type,
        discount_type: data.discount_type,
        ...(data.discount_type === 'AMOUNT' 
          ? { amount: parseFloat(data.amount), percentage: null } 
          : { percentage: parseFloat(data.percentage), amount: null }),
        brands: data.brands || [],
        branches: data.branches || [],
        countries: data.countries || [],
        discount_rule_type: data.discount_rule_type
      };

      const response = await discountService.updateDiscountRule(rule.id, payload);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Discount rule updated successfully",
          variant: "default",
        });
        onSuccess?.(response.data);
        onClose?.();
      } else {
        throw new Error(response.message || 'Failed to update discount rule');
      }
    } catch (error) {
      console.error('Error in onSubmit:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update discount rule",
      });
    } finally {
      setIsSubmitting(false);
    }
  }



  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      const currentValues = form.getValues();
      // Reset form with current rule data when closing
      form.reset({
        name: rule?.name || "",
        rule_code: rule?.rule_code || "",
        description: rule?.description || "",
        emc_code: rule?.emc_code || "",
        discount_type: currentValues.discount_type || 'AMOUNT',
        amount: currentValues.discount_type === 'AMOUNT' ? currentValues.amount : null,
        percentage: currentValues.discount_type === 'PRECENTAGE' ? currentValues.percentage : null,
        expiry_date: rule?.expiry_date ? new Date(rule.expiry_date).toISOString().slice(0, 16) : "",
        start_date: rule?.start_date ? new Date(rule.start_date).toISOString().slice(0, 10) : "",
        end_date: rule?.end_date ? new Date(rule.end_date).toISOString().slice(0, 10) : "",
        days_of_week: rule?.days_of_week || [],
        start_time: rule?.start_time || "",
        end_time: rule?.end_time || "",
        cooldown_period: rule?.cooldown_period || null,
        cooldown_value: rule?.cooldown_period ? parseInt(rule.cooldown_period.match(/\d+/) || '0') : 1,
        cooldown_unit: rule?.cooldown_period
          ? rule.cooldown_period.startsWith('PT')
            ? rule.cooldown_period.includes('H') ? 'HOURS' : 'MINUTES'
            : rule.cooldown_period.startsWith('P')
              ? rule.cooldown_period.includes('D') ? 'DAYS'
                : rule.cooldown_period.includes('M') ? 'MONTHS'
                  : 'YEARS'
              : 'HOURS'
          : 'HOURS',
        limitation: rule?.limitation || false,
        max_uses: rule?.max_uses?.toString() || "1",
        is_active: rule?.is_active !== undefined ? rule.is_active : true,
        brands: Array.isArray(rule?.brands)
          ? rule.brands.map(b => String(b.brand?.id || b))
          : rule?.brands ? [String(rule.brands.brand?.id || rule.brands)] : [],
        branches: Array.isArray(rule?.branches)
          ? rule.branches.map(b => String(b.branch?.id || b))
          : rule?.branches ? [String(rule.branches.branch?.id || rule.branches)] : [],
        countries: Array.isArray(rule?.countries)
          ? rule.countries.map(c => String(c.country_id))
          : rule?.countries ? [String(rule.countries.country_id)] : [],
        discount_rule_type: rule?.discount_rule_type
      });
    }

    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (!isOpen) {
      setOpen(newOpen);
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
      <DialogContent className="max-w-[95vw] w-full md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Edit Discount Rule</DialogTitle>
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
                        name="rule_code"
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
                          name="percentage"
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
                                    className={`w-full pr-8 ${form.formState.errors.percentage && 'border-red-500'}`}
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
                      console.log('Checkbox changed:', checked)
                      form.setValue('limitation', !!checked, { shouldValidate: true })
                      if (!checked) {
                        form.setValue('max_uses', null, { shouldValidate: true })
                      }
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-medium">Usage Limits</h3>
                    <p className="text-xs text-muted-foreground">
                      {limitation
                        ? form.watch('max_uses')
                          ? `Max ${form.watch('max_uses')} use${form.watch('max_uses') == 1 ? '' : 's'}`
                          : 'Usage limit enabled'
                        : 'Usage limit disabled'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newValue = !limitation
                    console.log('Toggle button clicked. New value:', newValue)
                    form.setValue('limitation', newValue, { shouldValidate: true })
                    if (!newValue) {
                      form.setValue('max_uses', null, { shouldValidate: true })
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground p-2 h-8 w-8"
                >
                  {limitation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {limitation && (
                <div className="pt-2 px-4 pb-4 space-y-4">
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
                              onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                              className="w-full"
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
                              placeholder="0"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                              className="w-full"
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
                            onValueChange={field.onChange}
                            value={field.value}
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
                    {limitation ? (
                      `Customers can use this discount ${form.getValues('max_uses') || 1} time${form.getValues('max_uses') != 1 ? 's' : ''} per ${form.getValues('cooldown_value') || 1} ${form.getValues('cooldown_unit')?.toLowerCase().replace('s', '')}${form.getValues('cooldown_value') != 1 ? 's' : ''}`
                    ) : (
                      'Usage limits are currently disabled. Enable the toggle above to set restrictions.'
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Expiry Date - Optional */}
            <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden" 
              defaultValue={
                rule?.days_of_week?.length > 0 || 
                rule?.start_time || rule?.end_time || rule?.expiry_date 
                  ? "datetime" 
                  : undefined
              }>
              <AccordionItem value="datetime">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="text-left">
                    <h3 className="text-sm font-medium">Date & Time Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      {form.watch('days_of_week')?.length > 0 || 
                       form.watch('start_time') || form.watch('end_time') || form.watch('expiry_date')
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

            {/* Location - Keep closed by default */}
            <Collapsible
              open={isLocationOpen}
            
              className="flex flex-col gap-2"
            >
          <div   onClick={() => setIsLocationOpen(!isLocationOpen)} className="flex items-center justify-between gap-4 px-4 cursor-pointer border">
            <h4 className="text-sm font-semibold">
              Location
            </h4>
            <p className="text-xs text-muted-foreground">
              {!rule?.countries?.length >0 ? "Click here to add locations" : "Click to Hide"}
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Rule'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 