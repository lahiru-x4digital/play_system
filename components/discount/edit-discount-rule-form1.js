"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { discountService } from "@/services/discount.service"
import { useToast } from "@/hooks/use-toast"
import { MultiSelect, MultiSelectItem } from "@/components/ui/multi-select"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rule_code: z.string().min(1, "Rule code is required"),
  description: z.string().optional(),
  emc_code: z.string().optional(),
  is_active: z.boolean().default(true),
  discount_type: z.enum(['AMOUNT', 'PRECENTAGE'], {
    required_error: "Discount type is required",
  }),
  amount: z.union([
    z.string(),
    z.number(),
    z.null()
  ]).optional().transform(val => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
  }),
  percentage: z.union([
    z.string(),
    z.number(),
    z.null()
  ]).optional().transform(val => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
  }),
  expiry_date: z.string().min(1, "Expiry date is required"),
  brand: z.array(z.string()).default([]),
  branch: z.array(z.string()).default([]),
  discountRuleTags: z.array(z.number()).default([])
})

export function EditDiscountRuleForm({
  rule,
  onClose,
  onSuccess,
  isDetailsPage
}) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [branches, setBranches] = useState([])
  const [brands, setBrands] = useState([])
  const [discountRuleTags, setDiscountRuleTags] = useState([])

  // Update the initial discount type determination
  const initialDiscountType = rule?.amount !== null && rule?.amount !== undefined
    ? 'AMOUNT'
    : 'PRECENTAGE'

  const initialDiscountValue = rule?.amount !== null && rule?.amount !== undefined
    ? rule.amount.toString()
    : rule.percentage?.toString() || ""

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rule?.name || "",
      rule_code: rule?.rule_code || "",
      description: rule?.description || "",
      emc_code: rule?.emc_code || "",
      is_active: rule?.is_active !== undefined ? rule.is_active : true,
      discount_type: initialDiscountType,
      amount: initialDiscountType === 'AMOUNT' ? rule?.amount?.toString() || "" : null,
      percentage: initialDiscountType === 'PRECENTAGE' ? rule?.percentage?.toString() || "" : null,
      expiry_date: rule?.expiry_date ? new Date(rule.expiry_date).toISOString().slice(0, 16) : "",
      brand: rule?.brands?.map(brand => String(brand.brand.id)) || [],
      branch: rule?.branches?.map(branch => String(branch.branch.id)) || [],
      discountRuleTags: rule?.discountRuleTags?.map(tag =>
        typeof tag === 'object' ? tag.tag_id : tag
      ) || []
    },
  })

  // Watch discount type
  const discountType = form.watch('discount_type')
  
  // Log form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('[EditDiscountRuleForm] Form field changed:', {
        field: name,
        type,
        value: name === 'discountRuleTags' ? 'Array of tags' : value[name],
        timestamp: new Date().toISOString()
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Log initial form values
  useEffect(() => {
    console.log('[EditDiscountRuleForm] Initial form values:', form.getValues());
    console.log('[EditDiscountRuleForm] Rule data from props:', rule);
  }, []);

  // Update the discount type change handler
  const handleDiscountTypeChange = (value) => {
    form.setValue('discount_type', value)

    // Transfer the value between amount and percentage fields
    const currentAmount = form.getValues('amount')
    const currentPercentage = form.getValues('percentage')

    if (value === 'AMOUNT') {
      form.setValue('amount', currentPercentage || currentAmount || '')
      form.setValue('percentage', null)
    } else {
      form.setValue('percentage', currentAmount || currentPercentage || '')
      form.setValue('amount', null)
    }
  }

  const onSubmit = async (data) => {
    console.log('[EditDiscountRuleForm] Form submission started with data:', JSON.stringify(data, null, 2));
    console.log('[EditDiscountRuleForm] Rule ID being updated:', rule?.id);
    
    try {
      setIsLoading(true);
      
      // Log form values before processing
      console.log('[EditDiscountRuleForm] Raw form values:', {
        ...data,
        is_active: data.is_active,
        discount_type: data.discount_type,
        brand_count: data.brand?.length || 0,
        branch_count: data.branch?.length || 0,
        tags_count: data.discountRuleTags?.length || 0
      });

      const payload = {
        name: data.name,
        rule_code: data.rule_code,
        description: data.description,
        emc_code: data.emc_code,
        is_active: data.is_active,
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,

        // Format brands and branches for API
        brands: Array.isArray(data.brand)
          ? data.brand.map(id => Number(id))
          : [],
        branches: Array.isArray(data.branch)
          ? data.branch.map(id => Number(id))
          : [],
        discountRuleTags: data.discountRuleTags || []
      };

      // Set either amount or percentage based on discount_type
      if (data.discount_type === 'AMOUNT') {
        payload.amount = data.amount ? Number(data.amount) : null;
        payload.percentage = null;
        console.log('[EditDiscountRuleForm] Using amount-based discount:', payload.amount);
      } else {
        payload.amount = null;
        payload.percentage = data.percentage ? Number(data.percentage) : null;
        console.log('[EditDiscountRuleForm] Using percentage-based discount:', payload.percentage);
      }

      console.log('[EditDiscountRuleForm] Sending update payload:', JSON.stringify(payload, null, 2));

      const response = await discountService.updateDiscountRule(rule.id, payload);
      console.log('[EditDiscountRuleForm] Update API response:', response);

      toast({
        title: "Success",
        description: "Discount rule updated successfully",
      });

      console.log('[EditDiscountRuleForm] Update successful, calling onSuccess callback');
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('[EditDiscountRuleForm] Failed to update discount rule:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        ruleId: rule?.id,
        timestamp: new Date().toISOString()
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to update discount rule',
      });
    } finally {
      console.log('[EditDiscountRuleForm] Form submission completed');
      setIsLoading(false);
    }
  }

  // Fetch data for dropdowns
  useEffect(() => {
    console.log('[EditDiscountRuleForm] Starting to fetch dropdown data');
    
    async function fetchData() {
      try {
        setIsLoadingData(true);
        console.log('[EditDiscountRuleForm] Fetching brands, branches, and tags...');
        
        const [brandsRes, branchesRes, tagsRes] = await Promise.all([
          discountService.getBrands(),
          discountService.getBranches(),
          discountService.getDiscountRuleTags()
        ]);

        console.log('[EditDiscountRuleForm] Received API responses:', {
          brandsCount: brandsRes?.data?.length || 0,
          branchesCount: branchesRes?.data?.length || 0,
          tagsCount: tagsRes?.data?.length || 0
        });

        if (brandsRes?.data) {
          console.log(`[EditDiscountRuleForm] Setting ${brandsRes.data.length} brands`);
          setBrands(brandsRes.data);
        } else {
          console.warn('[EditDiscountRuleForm] No brands data received');
        }
        
        if (branchesRes?.data) {
          console.log(`[EditDiscountRuleForm] Setting ${branchesRes.data.length} branches`);
          setBranches(branchesRes.data);
        } else {
          console.warn('[EditDiscountRuleForm] No branches data received');
        }

        // Handle tags response
        if (tagsRes?.success && Array.isArray(tagsRes.data)) {
          const processedTags = tagsRes.data.map(tag => ({
            id: tag.id,
            tag_name: tag.tag_name,
            description: tag.description
          }));
          console.log(`[EditDiscountRuleForm] Setting ${processedTags.length} tags`);
          setDiscountRuleTags(processedTags);
          
          // Log if any tags are selected by default
          const selectedTags = form.getValues('discountRuleTags') || [];
          if (selectedTags.length > 0) {
            console.log('[EditDiscountRuleForm] Pre-selected tags:', {
              count: selectedTags.length,
              selectedTags
            });
          }
        } else {
          console.warn('[EditDiscountRuleForm] Invalid tags response:', tagsRes);
          setDiscountRuleTags([]);
        }

      } catch (error) {
        console.error('[EditDiscountRuleForm] Failed to fetch form data:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load form data. Please try again.",
        });
      } finally {
        console.log('[EditDiscountRuleForm] Finished loading dropdown data');
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [toast, form]);

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
    <Dialog open={true} onOpenChange={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <DialogContent className="max-w-[95vw] w-full md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Edit Discount Rule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Rule Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter rule code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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
                <FormItem>
                  <FormLabel>EMC Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Brands</FormLabel>
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
                            key={`brand-${brand.id}`}
                            value={brand.brand_name}
                          >
                            {brand.brand_name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Branches</FormLabel>
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
                            key={`branch-${branch.id}`}
                            value={branch.branch_name}
                          >
                            {branch.branch_name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium">Discount Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Discount Type</FormLabel>
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
                        <SelectItem value="PRECENTAGE">Precentage</SelectItem>
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
                      <FormLabel className="text-sm font-medium">Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value ?? ''}
                            className="w-full pr-8"
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
                      <FormLabel className="text-sm font-medium">Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...field}
                            value={field.value ?? ''}
                            className="w-full pr-8"
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

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      className="w-full"
                      onChange={(e) => {
                        field.onChange(e)
                        e.target.blur() // This will close the date picker after selection
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Single Tags field */}
            {isDetailsPage && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tags</h3>
                <FormField
                  control={form.control}
                  name="discountRuleTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Discount Tags</FormLabel>
                      <FormControl>
                        <MultiSelect
                          value={
                            field.value?.map(tagId => {
                              const tag = discountRuleTags.find(t => t.id === tagId);
                              return tag?.tag_name || '';
                            }).filter(Boolean) || []
                          }
                          onValueChange={(selectedNames) => {
                            const selectedValues = Array.isArray(selectedNames)
                              ? selectedNames
                              : [selectedNames];
                            const tagIds = selectedValues
                              .map(name => {
                                const tag = discountRuleTags.find(t => t.tag_name === name);
                                return tag ? tag.id : null;
                              })
                              .filter(Boolean);
                            field.onChange(tagIds);
                          }}
                          placeholder="Select tags"
                        >
                          {discountRuleTags && discountRuleTags.length > 0 ? (
                            discountRuleTags.map((tag) => (
                              <MultiSelectItem
                                key={`tag-${tag.id}`}
                                value={tag.tag_name}
                              >
                                {tag.tag_name}
                              </MultiSelectItem>
                            ))
                          ) : (
                            <MultiSelectItem
                              key="no-tags"
                              value="no-tags-available"
                              disabled
                            >
                              No tags available
                            </MultiSelectItem>
                          )}
                        </MultiSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Active State */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm sm:text-base">Active State</FormLabel>
                    <FormDescription className="text-xs">
                      Enable or disable this discount rule
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

            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 