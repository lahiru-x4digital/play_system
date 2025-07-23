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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
  emc_code: z.string().optional(),
}).refine(data => {
  const hasAmount = data.amount != null && data.amount > 0;
  const hasPercentage = data.percentage != null && data.percentage > 0;
  return (hasAmount && !hasPercentage) || (!hasAmount && hasPercentage);
}, {
  message: "Please provide either amount or percentage",
  path: ['amount', 'percentage']
});

export function EditDiscountCodeForm({ code, onClose, onSuccess }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [countries, setCountries] = useState([])
  const [brands, setBrands] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedBranches, setSelectedBranches] = useState([])
  const [discountType, setDiscountType] = useState(code?.amount ? 'amount' : 'percentage')

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      country: null,
      brands: [],
      branches: [],
      amount: '',
      percentage: '',
      limit_per_customer: 1,
      expire_date: '',
      is_active: true,
      emc_code: '',
    },
    mode: "onChange",
  })

  // Initialize selected brands and branches from the code prop
  useEffect(() => {
    if (code && brands.length > 0 && branches.length > 0) {
      // Set initial brands
      if (code.brands && Array.isArray(code.brands)) {
        const initialBrands = code.brands.map(brand => {
          // Get the ID, handling both string and object cases
          const brandId = (brand.brand_id || brand.id || brand).toString();

          // Find the matching brand from the loaded brands list
          const matchingBrand = brands.find(b => (b._id || b.id).toString() === brandId);

          if (matchingBrand) {
            return {
              id: brandId,
              brand_name: matchingBrand.brand_name,
              brand_id: matchingBrand.brand_id
            };
          }

          // If brand object has its own properties, use those
          if (typeof brand === 'object') {
            return {
              id: brandId,
              brand_name: brand.brand_name || brand.name,
              brand_id: brand.brand_id || brandId
            };
          }

          return null;
        }).filter(Boolean); // Remove any null values

        setSelectedBrands(initialBrands);
        form.setValue('brands', initialBrands.map(b => b.id), { shouldValidate: true });
      }

      // Set initial branches
      if (code.branches && Array.isArray(code.branches)) {
        const initialBranches = code.branches.map(branch => {
          // Get the ID, handling both string and object cases
          const branchId = (branch.branch_id || branch.id || branch).toString();


          // Find the matching branch from the loaded branches list
          const matchingBranch = branches.find(b => (b._id || b.id).toString() === branchId);

          if (matchingBranch) {
            return {
              id: branchId,
              branch_name: matchingBranch.branch_name,
              branch_id: matchingBranch.branch_id
            };
          }

          // If branch object has its own properties, use those
          if (typeof branch === 'object') {
            return {
              id: branchId,
              branch_name: branch.branch_name || branch.name,
              branch_id: branch.branch_id || branchId
            };
          }

          return null;
        }).filter(Boolean); // Remove any null values

        setSelectedBranches(initialBranches);
        form.setValue('branches', initialBranches.map(b => b.id), { shouldValidate: true });
      }
    }
  }, [code, form, brands, branches]);

  const handleBrandChange = useCallback((selectedValue) => {
    console.log('handleBrandChange selectedValue:', selectedValue);
    const brandObject = brands.find(brand =>
      (brand.id?.toString() === selectedValue || brand._id?.toString() === selectedValue)
    );
    console.log('Found brand object:', brandObject);

    if (brandObject) {
      let newSelectedBrands = [...selectedBrands];
      const existingIndex = newSelectedBrands.findIndex(b =>
        b.id === selectedValue
      );

      if (existingIndex === -1) {
        const newBrand = {
          id: selectedValue,
          brand_name: brandObject.brand_name || brandObject.name
        };
        console.log('Adding new brand:', newBrand);
        newSelectedBrands = [...newSelectedBrands, newBrand];
      } else {
        console.log('Removing brand with id:', selectedValue);
        newSelectedBrands = newSelectedBrands.filter(b => b.id !== selectedValue);
      }

      console.log('Updated selected brands:', newSelectedBrands);
      setSelectedBrands(newSelectedBrands);
      form.setValue("brands", newSelectedBrands.map(b => b.id), { shouldValidate: true });
    }
  }, [brands, selectedBrands, form]);

  const handleBranchChange = useCallback((selectedValue) => {
    console.log('handleBranchChange selectedValue:', selectedValue);
    const branchObject = branches.find(branch =>
      (branch.id?.toString() === selectedValue || branch._id?.toString() === selectedValue)
    );
    console.log('Found branch object:', branchObject);

    if (branchObject) {
      let newSelectedBranches = [...selectedBranches];
      const existingIndex = newSelectedBranches.findIndex(b =>
        b.id === selectedValue
      );

      if (existingIndex === -1) {
        const newBranch = {
          id: selectedValue,
          branch_name: branchObject.branch_name || branchObject.name
        };
        console.log('Adding new branch:', newBranch);
        newSelectedBranches = [...newSelectedBranches, newBranch];
      } else {
        console.log('Removing branch with id:', selectedValue);
        newSelectedBranches = newSelectedBranches.filter(b => b.id !== selectedValue);
      }

      console.log('Updated selected branches:', newSelectedBranches);
      setSelectedBranches(newSelectedBranches);
      form.setValue("branches", newSelectedBranches.map(b => b.id), { shouldValidate: true });
    }
  }, [branches, selectedBranches, form]);

  // Add this useEffect at the top with other useEffects
  useEffect(() => {
    const initializeFormData = async () => {
      if (code) {

        // Get the country ID from the existing data
        let countryId;
        if (code.countries && code.countries.length > 0) {
          // Access the country_id from the first country in the array
          countryId = code.countries[0].country_id;
        } else if (code.country) {
          countryId = code.country.id || code.country._id || code.country;
        }

        if (countryId) {
          const parsedCountryId = parseInt(countryId);
          form.setValue('country', parsedCountryId, { shouldValidate: true });
        } else {
          console.log('No country ID found in existing data');
        }

        // Set other form values
        form.setValue('name', code.name || '');
        form.setValue('code', code.code || '');
        form.setValue('description', code.description || '');
        form.setValue('emc_code', code.emc_code || '');
        form.setValue('amount', code.amount || '');
        form.setValue('percentage', code.percentage || '');
        form.setValue('limit_per_customer', code.limit_per_customer || 1);
        form.setValue('expire_date',
          code.expire_date ? new Date(code.expire_date).toISOString().slice(0, 16) : ''
        );
        form.setValue('is_active', code.is_active ?? true);
      }
    };

    initializeFormData();
  }, [code, form]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)

      // Ensure country value exists and is valid
      if (!data.country) {
        throw new Error('Country is required');
      }

      const countryId = parseInt(data.country);
      if (isNaN(countryId)) {
        throw new Error('Invalid country ID');
      }

      // Improved validation and transformation for brands
      const validBrands = selectedBrands
        .filter(brand => brand && brand.id)
        .map(brand => parseInt(brand.id))
        .filter(id => !isNaN(id));

      // Improved validation and transformation for branches
      const validBranches = selectedBranches
        .filter(branch => branch && branch.id)
        .map(branch => parseInt(branch.id))
        .filter(id => !isNaN(id));

      // Prepare the payload with simple country ID
      const payload = {
        name: data.name,
        code: data.code,
        description: data.description,
        emc_code: data.emc_code,
        country: countryId, // Direct country ID
        brands: validBrands,
        branches: validBranches,
        amount: data.amount ? parseFloat(data.amount) : null,
        percentage: data.percentage ? parseFloat(data.percentage) : null,
        limit_per_customer: parseInt(data.limit_per_customer),
        expire_date: data.expire_date ? new Date(data.expire_date).toISOString() : null,
        is_active: data.is_active
      }

      await discountService.updateDiscountCode(code.id, payload)

      toast({
        title: "Success",
        description: "Discount code updated successfully",
      })

      onSuccess?.()
      onClose?.()

    } catch (error) {
      console.error('Failed to update discount code:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        data: error.response?.data,
        payload: error.config?.data
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update discount code",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add logging to country selection change
  const handleCountryChange = (value) => {
    const parsedValue = parseInt(value);
    form.setValue('country', parsedValue, { shouldValidate: true });

  };

  // Fetch data for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingData(true)
        const [countriesRes, brandsRes, branchesRes] = await Promise.all([
          discountService.getCountries(),
          discountService.getBrands(),
          discountService.getBranches(),
        ])

        if (countriesRes?.data) {
          setCountries(countriesRes.data)
        }
        if (brandsRes?.data) {
          setBrands(brandsRes.data)
        }
        if (branchesRes?.data) {
          setBranches(branchesRes.data)
        }
      } catch (error) {
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
  }, [toast])

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
          <SelectItem
            key={`brand-${item.id || item._id}`}
            value={(item.id || item._id).toString()}
          >
            {`${item.brand_name || item.name} (${item.brand_id || item.id || item._id})`}
          </SelectItem>
        ))
      case 'branch':
        return items.map((item) => (
          <SelectItem
            key={`branch-${item.id || item._id}`}
            value={(item.id || item._id).toString()}
          >
            {`${item.branch_name || item.name} (${item.branch_id || item.id || item._id})`}
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl sm:text-2xl">Edit Discount Code</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                        value={selectedBrands.map(brand => brand.brand_name)}
                        onValueChange={(selectedNames) => {
                          const selectedValues = Array.isArray(selectedNames) ? selectedNames : [selectedNames];
                          selectedValues.forEach(name => handleBrandChange(
                            brands.find(b => b.brand_name === name)?.id?.toString()
                          ));
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
                        value={selectedBranches.map(branch => branch.branch_name)}
                        onValueChange={(selectedNames) => {
                          const selectedValues = Array.isArray(selectedNames) ? selectedNames : [selectedNames];
                          selectedValues.forEach(name => handleBranchChange(
                            branches.find(b => b.branch_name === name)?.id?.toString()
                          ));
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

            {/* Discount Settings */}
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
                        onValueChange={setDiscountType}
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

            {/* Additional Settings */}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 