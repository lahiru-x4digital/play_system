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
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { customerService } from "@/services/customer.service"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { FormDescription } from "@/components/ui/form"
import { validatePhoneNumber, formatPhoneNumberAsYouType, extractCountryCode, getISOCountryCode } from "@/utils/phone-validation"

// Simple schema with only mobile_number required
const formSchema = (isDetailsPage) => {
  let baseSchema = z.object({
    birthdate: z.string().optional(),
    branch_id: z.any().optional(),
    customer_level: z.string().optional(),
    gender: z.string().optional(),
    customer_type: z.string().optional(),
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    mobile_number: z.string()
      .min(1, "Mobile number is required")
      .refine((val) => {
        const countryCode = extractCountryCode(val);
        const isoCode = getISOCountryCode(countryCode);
        const validation = validatePhoneNumber(val, isoCode);
        return validation.isValid;
      }, (val) => {
        const countryCode = extractCountryCode(val);
        const isoCode = getISOCountryCode(countryCode);
        const validation = validatePhoneNumber(val, isoCode);
        return { message: validation.error || 'Please enter a valid phone number' };
      }),
    preferred_language: z.string().optional(),
    isWhatsApp: z.boolean().optional().default(true),
    isSMS: z.boolean().optional().default(true),
    isEmail: z.boolean().optional().default(true),
    employee_id: z.string().optional(),
  });

  if (isDetailsPage) {
    baseSchema = baseSchema.extend({
      tags: z.array(z.any()).optional().default([]),
      tagNames: z.array(z.string()).optional().default([])
    });
  }

  // Add refinement for employee_id only for INDPT - Family
  return baseSchema.refine(
    (data) => {
      if (data.customer_type === "INDPT - Family") {
        return !!data.employee_id && data.employee_id.trim() !== "";
      }
      return true;
    },
    {
      message: "Employee ID is required for INDPT - Family",
      path: ["employee_id"],
    }
  );
}

const languages = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
]

const customerTypes = [
  { value: "Family and friends", label: "Family and friends" },
  { value: "Influencer - A", label: "Influencer - A" },
  { value: "Influencer - B", label: "Influencer - B" },
  { value: "Owners", label: "Owners" },
  { value: "INDPT - Family", label: "INDPT - Family" }
]

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
]

export function EditCustomerForm({ customer, onClose, onSuccess, isDetailsPage = false }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [availableTags, setAvailableTags] = useState([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [selectedTag, setSelectedTag] = useState("")

  // Format the ISO date string to YYYY-MM-DD for the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split('T')[0]
  }

  // Get initial values from customer data
  const defaultValues = {
    birthdate: formatDateForInput(customer.birthdate),
    branch_id: customer.branch_id || "",
    customer_level: customer.customer_level || "WHITE",
    gender: customer.gender || "",
    customer_type: customer.customer_type || "",
    email: customer.email || "",
    first_name: customer.first_name || "",
    last_name: customer.last_name || "",
    mobile_number: customer.mobile_number || "",
    preferred_language: customer.preferred_language || "",
    tags: customer.tags || [],
    tagNames: customer.tagNames || [],
    isWhatsApp: customer.isWhatsApp ?? true,
    isSMS: customer.isSMS ?? true,
    isEmail: customer.isEmail ?? true,
    employee_id: customer.customer_type === "INDPT - Family" ? customer.employee_id || "" : ""
  };

  // Initialize form with simplified validation
  const form = useForm({
    resolver: zodResolver(formSchema(isDetailsPage)),
    defaultValues,
    mode: "onChange" // Validate on every change
  });

  // Track if mobile number is valid
  const [isMobileValid, setIsMobileValid] = useState(!!defaultValues.mobile_number);

  // Watch mobile number changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'mobile_number' || name === undefined) {
        const mobileValue = value.mobile_number || "";
        setIsMobileValid(mobileValue.length > 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    async function fetchBranches() {
      setIsLoadingBranches(true)
      try {
        const response = await customerService.getBranches()
        if (response.success && response.data) {
          setBranches(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      } finally {
        setIsLoadingBranches(false)
      }
    }

    fetchBranches()
  }, [])

  useEffect(() => {
    async function fetchTags() {
      if (isDetailsPage) {
        setIsLoadingTags(true)
        try {
          const response = await customerService.getTags()
          if (response.success) {
            console.log('Fetched tags:', response.data)
            setAvailableTags(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch tags:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load tags"
          })
        } finally {
          setIsLoadingTags(false)
        }
      }
    }

    fetchTags()
  }, [isDetailsPage, toast])

  const handleAddTag = (tagId) => {
    const selectedTagObj = availableTags.find(tag => tag.id.toString() === tagId)
    if (!selectedTagObj) return

    const currentTagIds = form.getValues("tags") || []
    const currentTagNames = form.getValues("tagNames") || []

    if (!currentTagIds.includes(selectedTagObj.id)) {
      form.setValue("tags", [...currentTagIds, Number(selectedTagObj.id)])
      form.setValue("tagNames", [...currentTagNames, selectedTagObj.name])
    }
    setSelectedTag("")
  }

  const handleRemoveTag = (tagName) => {
    const tagObj = availableTags.find(tag => tag.name === tagName)
    if (!tagObj) return

    const currentTagIds = form.getValues("tags") || []
    const currentTagNames = form.getValues("tagNames") || []

    form.setValue("tags", currentTagIds.filter(id => id !== Number(tagObj.id)))
    form.setValue("tagNames", currentTagNames.filter(name => name !== tagName))
  }

  async function onSubmit(data) {
    // Only send employee_id if customer_type is 'INDPT - Family'
    if (data.customer_type !== "INDPT - Family") {
      delete data.employee_id;
    }

    const formattedData = {
      birthdate: data.birthdate,
      branch_id: data.branch_id ? parseInt(data.branch_id, 10) : undefined,
      customer_level: data.customer_level,
      gender: data.gender,
      customer_type: data.customer_type,
      email: data.email?.toLowerCase(),
      first_name: data.first_name,
      last_name: data.last_name,
      mobile_number: data.mobile_number,
      preferred_language: data.preferred_language,
      tag_ids: isDetailsPage ? data.tags?.map(Number) : undefined,
      isWhatsApp: data.isWhatsApp,
      isSMS: data.isSMS,
      isEmail: data.isEmail,
      // Add employee_id only if present in data
      ...(data.customer_type === "INDPT - Family" && data.employee_id ? { employee_id: data.employee_id } : {})
    }

    try {
      setIsLoading(true)

      console.log('Submitting data:', formattedData)

      const response = await customerService.updateCustomer(customer.id, formattedData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Customer updated successfully"
        })
        onSuccess?.()
        onClose()
      } else {
        throw new Error(response.message || 'Failed to update customer')
      }
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update customer"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Edit Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            {/* mobile_number Field */}
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+971526374859"
                      {...field}
                      className="w-full"
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            {/* <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => {
                const countryCode = field.value ? extractCountryCode(field.value) : '971';
                const isoCode = getISOCountryCode(countryCode);
                const validation = validatePhoneNumber(field.value, isoCode);
                
                return (
                  <FormItem>
                    <FormLabel 
                      data-phone-label
                      className={`text-sm sm:text-base ${!validation.isValid ? 'text-red-500 font-medium' : ''}`}
                    >
                      Mobile Number*
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneInput
                          country={'ae'}
                          value={field.value}
                          onChange={(phone, countryData) => {
                            // Get the country code from the selected country
                            const countryCode = countryData.dialCode;
                            const isoCode = getISOCountryCode(countryCode);
                            
                            // Validate the phone number
                            const validation = validatePhoneNumber(phone, isoCode);
                            
                            // Update the form field
                            field.onChange(phone);
                            
                            // Set error in form state if number is invalid
                            if (!validation.isValid) {
                              form.setError('mobile_number', {
                                type: 'manual',
                                message: validation.error
                              });
                            } else {
                              form.clearErrors('mobile_number');
                            }
                            
                            // Update validation state immediately
                            const labelElement = document.querySelector('[data-phone-label]');
                            const messageElement = document.querySelector('[data-phone-validation-message]');
                            
                            if (!validation.isValid) {
                              if (labelElement) {
                                labelElement.classList.add('text-red-500', 'font-medium');
                              }
                              if (messageElement) {
                                messageElement.textContent = validation.error;
                                messageElement.className = 'text-xs mt-1 text-red-500 font-medium';
                              }
                            } else {
                              if (labelElement) {
                                labelElement.classList.remove('text-red-500', 'font-medium');
                              }
                              if (messageElement) {
                                messageElement.textContent = '';
                                messageElement.className = 'text-xs mt-1';
                              }
                            }
                          }}
                          inputClass={`w-full p-2 border rounded ${!validation.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          containerClass="w-full"
                          buttonClass={!validation.isValid ? 'border-red-500' : ''}
                          dropdownStyle={{ zIndex: 50 }}
                          specialLabel=""
                          enableSearch={true}
                          disableSearchIcon={true}
                          searchPlaceholder="Search country..."
                          preferredCountries={['ae', 'sa', 'lk', 'us', 'gb']}
                          enableAreaCodes={true}
                        />
                        <div 
                          data-phone-validation-message 
                          className={`text-xs mt-1 ${validation.isValid ? '' : 'text-red-500 font-medium'}`}
                        >
                          {validation.error || ''}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      {`Enter phone number with country code (e.g., +${countryCode} ...)`}
                    </FormDescription>
                  </FormItem>
                );
              }}
            /> */}

            {/* Language and Birthdate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => {
                  const maxDate = new Date();
                  maxDate.setFullYear(maxDate.getFullYear() - 18);
                  const maxDateString = maxDate.toISOString().split('T')[0];
                  return (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Birthdate</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="w-full"
                          max={maxDateString}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Customer Level and Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Customer Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem key="level-WHITE" value="WHITE">White</SelectItem>
                        <SelectItem key="level-GRAY" value="GRAY">Gray</SelectItem>
                        <SelectItem key="level-BLACK" value="BLACK">Black</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Branch</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const branchId = parseInt(value, 10);
                        field.onChange(branchId);
                      }}
                      value={field.value?.toString()}
                      // disabled={isLoadingBranches}
                      disabled={true}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingBranches ? "Loading branches..." : "Select branch"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingBranches ? (
                          <SelectItem key="loading" value="loading" disabled>
                            Loading branches...
                          </SelectItem>
                        ) : branches && branches.length > 0 ? (
                          branches.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id.toString()}
                            >
                              {branch.branch_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem key="no-branches" value="no-branches" disabled>
                            No branches available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags Field - Only show on details page */}
            {isDetailsPage && (
              <div className="space-y-2">
                <FormLabel className="text-sm sm:text-base">Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch("tagNames")?.map((tagName) => (
                    <Badge key={`badge-${tagName}`} variant="secondary" className="px-2 py-1">
                      {tagName}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tagName)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedTag}
                    onValueChange={handleAddTag}
                    disabled={isLoadingTags}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingTags ? "Loading tags..." : "Select a tag"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTags && (
                        <SelectItem key="tag-loading" value="loading" disabled>
                          Loading tags...
                        </SelectItem>
                      )}
                      {!isLoadingTags && availableTags && availableTags.length > 0 && (
                        availableTags
                          .filter(tag => !form.watch("tagNames")?.includes(tag.name))
                          .map((tag) => (
                            <SelectItem
                              key={`select-tag-${tag.id}`}
                              value={tag.id.toString()}
                            >
                              {tag.name}
                            </SelectItem>
                          ))
                      )}
                      {!isLoadingTags && (!availableTags || availableTags.length === 0) && (
                        <SelectItem key="tag-no-tags" value="no-tags" disabled>
                          No tags available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Available tags: {availableTags?.length || 0}
                </div>
              </div>
            )}

            {/* Customer Type Field */}
            {isDetailsPage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              {/* Employee ID field to the right, Customer Type to the left */}
              {form.watch("customer_type") === "INDPT - Family" ? (
                <>
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="customer_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Type</FormLabel>
                          <div className="flex gap-2 items-end">
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customerTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => form.setValue('customer_type', '')}
                              className="ml-2 flex items-center justify-center h-10 w-10 p-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              disabled={!field.value}
                              aria-label="Clear"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="employee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Employee ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="customer_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <div className="flex gap-2 items-end">
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customerTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue('customer_type', '')}
                            className="ml-2 flex items-center justify-center h-10 w-10 p-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            disabled={!field.value}
                            aria-label="Clear"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            )}

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-medium">Communication Preferences</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="isWhatsApp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          WhatsApp
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Subscribe to receive WhatsApp notifications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSMS"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          SMS
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Subscribe to receive SMS notifications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Email
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Subscribe to receive email notifications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Buttons */}
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
                disabled={isLoading || !form.formState.isValid || (form.formState.errors.mobile_number !== undefined)}
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