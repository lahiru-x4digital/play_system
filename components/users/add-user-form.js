"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { userService } from "@/services/user.service"
import { 
  validatePhoneNumber, 
  extractCountryCode, 
  getISOCountryCode 
} from "@/utils/phone-validation"
import { branchService } from "@/services/branch.service"
import { brandService } from "@/services/brand.service"
import { countryService } from "@/services/country.service"
import { Loader2, Eye, EyeOff, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import SelectBranch from "../common/selectBranch"

const formSchema = z.object({
  mobile_number: z
    .string()
    .min(1, 'Mobile number is required')
    .refine(
      (val) => {
        const countryCode = extractCountryCode(val);
        const isoCode = getISOCountryCode(countryCode);
        const validation = validatePhoneNumber(val, isoCode);
        return validation.isValid;
      },
      (val) => {
        const countryCode = extractCountryCode(val);
        const isoCode = getISOCountryCode(countryCode);
        const validation = validatePhoneNumber(val, isoCode);
        return {
          message: validation.error || "Please enter a valid phone number",
        };
      }
    ),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password is required'),
  preferred_language: z.string().optional(),
  user_type: z.string().min(1, 'User type is required'),
  brand_id: z.string().optional(),
  branch_id: z.string().optional(),
  country_id: z.string().optional(),
})

// Custom validation function for the form
const validateForm = (data, session) => {
  // For non-superadmin and non-USER types, branch is required
  if (data.user_type !== 'SUPERADMIN' && data.user_type !== 'USER' && !data.branch_id) {
    return {
      success: false,
      error: 'Please select a branch for this user type'
    };
  }
  
  // For USER type, we need a branch_id in the session
  if (data.user_type === 'USER' && !session?.user?.branchId) {
    return {
      success: false,
      error: 'Your account does not have an associated branch. Cannot create Care Team user.'
    };
  }
  
  return { success: true };
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
]

const userTypes = [
  // { value: "SUPERADMIN", label: "Super Admin" },
  // { value: "BRANCH_USER", label: "Branch User" },
  // { value: "BRANCH_MANAGER", label: "Branch Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  // { value: "ORGANIZATION_USER", label: "Care Admin" },
]

export function AddUserForm({ open, onOpenChange, onSuccess }) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [brands, setBrands] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoadingBrands, setIsLoadingBrands] = useState(false)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countries, setCountries] = useState([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      mobile_number: "",
      preferred_language: "",
      user_type: "",
      password: "",
      branch_id: "",
      country_id: "",
    },
    mode: "all",
  })

  // Watch for user type changes
  const userType = form.watch('user_type')
  
  // Set branch_id from session when user type is USER (Care Team)
  useEffect(() => {
    if (userType === 'USER' && session?.user?.branchId) {
      console.log('[AddUserForm] Setting branch_id from session:', session.user.branchId);
      form.setValue('branch_id', session.user.branchId.toString(), { shouldValidate: true });
    }
  }, [userType, session, form])

  const onFormSubmit = async (data) => {
    console.log('[AddUserForm] Form submission started with data:', data);
    
    // For Care Team users, ensure we have the branch_id from session
    if (data.user_type === 'USER') {
      if (session?.user?.branchId) {
        data.branch_id = session.user.branchId.toString();
        console.log('[AddUserForm] Using branch_id from session:', data.branch_id);
      } else {
        console.warn('[AddUserForm] No branchId in session for Care Team user');
        toast({
          title: "Error",
          description: "Your account does not have an associated branch. Cannot create Care Team user.",
          variant: "destructive",
        });
        return;
      }
    }

    // First validate all required fields
    const result = formSchema.safeParse(data);
    if (!result.success) {
      console.warn('[AddUserForm] Form validation failed:', result.error);
      result.error.errors.forEach((err) => {
        toast({
          title: "Validation Error",
          description: `${err.path.join('.')} ${err.message}`,
          variant: "destructive",
        });
      });
      return;
    }
    
    // Run custom validation
    const customValidation = validateForm(data, session);
    if (!customValidation.success) {
      toast({
        title: "Validation Error",
        description: customValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Additional phone number validation
    const countryCode = extractCountryCode(data.mobile_number);
    const isoCode = getISOCountryCode(countryCode);
    const phoneValidation = validatePhoneNumber(data.mobile_number, isoCode);
    
    if (!phoneValidation.isValid) {
      toast({
        title: "Phone Validation Error",
        description: phoneValidation.error || "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Branch ID is already validated in the custom validation function

      // Format the data for API
      const userData = {
        mobile_number: data.mobile_number.replace(/\D/g, ''), // Remove non-digits for API compatibility
        email: data.email?.toLowerCase(),
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        branch_id: data.branch_id ? parseInt(data.branch_id, 10) : null,
        brand_id: data.brand_id ? parseInt(data.brand_id, 10) : undefined,
        preferred_language: data.preferred_language || undefined,
        user_type: data.user_type,
        password: data.password
      };

      // For SUPERADMIN, always send organization_id: 1
      if (data.user_type === 'SUPERADMIN') {
        userData.organization_id = 1;
      }

      // Remove any undefined or empty values
      const formattedData = Object.fromEntries(
        Object.entries(userData)
          .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      );

      console.log('[AddUserForm] Sending user data to API:', JSON.stringify(formattedData, null, 2));

      const startTime = Date.now();
      const response = await userService.createUser(formattedData);
      const endTime = Date.now();

      console.log(`[AddUserForm] User creation completed in ${endTime - startTime}ms`, {
        success: response.success,
        message: response.message,
        userId: response.data?.id
      });

      if (response.success) {
        // Show success message with email status
        const successMsg = response.message || "User created successfully";
        console.log(`[AddUserForm] ${successMsg}`, response.data);

        toast({
          title: "Success",
          description: successMsg,
          duration: 5000 // Show for 5 seconds
        });

        // Clear form and close dialog
        clearDraft();
        onSuccess?.();
        onOpenChange(false);
      } else {
        const errorMsg = response.message || 'Failed to create user';
        console.error('[AddUserForm] User creation failed:', errorMsg, response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('[AddUserForm] Form submission error:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data
      });

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create user"
      });
    } finally {
      console.log('[AddUserForm] Form submission completed');
      setIsLoading(false);
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('userFormDraft')
    form.reset({
      email: "",
      first_name: "",
      last_name: "",
      mobile_number: "",
      preferred_language: "",
      user_type: "",
      password: "",
      branch_id: "",
      country_id: "",
    })
  }
  const handleSaveAsDraft = () => {
    const formData = form.getValues()
    localStorage.setItem('userFormDraft', JSON.stringify(formData))
    onOpenChange(false)
  }

  // Fetch countries for the filter
  const fetchCountries = async () => {
    try {
      setIsLoadingCountries(true)
      const response = await countryService.getAllCountries()
      if (response.success) {
        setCountries(response.data)
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load countries"
      })
    } finally {
      setIsLoadingCountries(false)
    }
  }

  // Handle country change
  const handleCountryChange = async (countryId) => {
    setSelectedCountry(countryId)
    form.setValue('brand_id', '')
    form.setValue('branch_id', '')
    setBrands([])
    setBranches([])
    
    if (countryId) {
      await fetchBrands(countryId)
    }
  }

  // Fetch brands by country
  const fetchBrands = async (countryId) => {
    try {
      setIsLoadingBrands(true)
      const response = await brandService.getAllBrandsWithoutFiles({ country_id: countryId })
      if (response.success) {
        setBrands(response.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load brands"
      })
    } finally {
      setIsLoadingBrands(false)
    }
  }

  // Fetch branches when brand changes or on initial load
  const fetchBranchesByBrand = async (brandId) => {
    try {
      setIsLoadingBranches(true)
      let response;

      if (brandId) {
        response = await branchService.getBranchesByBrandId(brandId);
      } else {
        response = await branchService.getAllBranchesWithoutFiles(); // Fetch first 100 branches
      }

      if (response.success || (response.data && Array.isArray(response.data))) {
        setBranches(response.data || response.data)
      } else {
        setBranches([])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load branches"
      })
      setBranches([])
    } finally {
      setIsLoadingBranches(false)
    }
  }

  // Watch for brand changes to filter branches
  useEffect(() => {
    const brandId = form.watch('brand_id')
    if (brandId) {
      fetchBranchesByBrand(brandId)
      // Reset branch selection when brand changes
      form.setValue('branch_id', '')
    }
  }, [form.watch('brand_id')])

  // Initialize countries on mount
  useEffect(() => {
    if (open) {
      fetchCountries()
    }
  }, [open])
  console.log(form.watch('branch_id'));

  // useEffect(() => {
  //   const fetchBrands = async () => {
  //     try {
  //       setIsLoadingBrands(true)
  //       const response = await brandService.getAllBrandsWithoutFiles() // Fetch first 100 brands
  //       if (response.success) {
  //         setBrands(response.data)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching brands:', error)
  //       toast({
  //         variant: "destructive",
  //         title: "Error",
  //         description: "Failed to load brands"
  //       })
  //     } finally {
  //       setIsLoadingBrands(false)
  //     }
  //   }

  //   if (open) {
  //     const savedDraft = localStorage.getItem('userFormDraft')
  //     if (savedDraft) {
  //       const draft = JSON.parse(savedDraft)
  //       form.reset(draft)

  //       // If there's a brand_id in the draft, fetch branches for that brand
  //       if (draft.brand_id) {
  //         fetchBranchesByBrand(draft.brand_id)
  //       } else {
  //         fetchBranchesByBrand()
  //       }
  //     } else {
  //       fetchBranchesByBrand()
  //     }
  //     fetchBrands()
  //   } else {
  //     form.reset()
  //   }
  // }, [open, form, toast])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Add New User</DialogTitle>
          <DialogDescription>
            Create a new user
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4" noValidate>
            {/* Name Fields - Responsive Grid */}
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
            <FormField
              control={form.control}
              name="user_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">User Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {
                        userTypes.map((userType, index) => (
                          <SelectItem key={index} value={userType.value}>
                            {userType.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <Controller
              name="branch_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectBranch
                  value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                  onChange={(val) => field.onChange(val.toString())}
                  error={fieldState.error?.message}
                  label="Branch"
                />
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...field}
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            {/* Mobile Number and Language in the same row */}
            <div className="flex flex-row gap-4">            <FormField
              className="w-full"
              control={form.control}
              name="mobile_number"
              render={({ field }) => {
                const countryCode = field.value
                  ? extractCountryCode(field.value)
                  : "971"; // Default to UAE
                const isoCode = getISOCountryCode(countryCode);
                const validation = validatePhoneNumber(field.value, isoCode);

                return (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm sm:text-base">Mobile Number*</FormLabel>
                    <FormControl>
                      <PhoneInput
                        country={'ae'} // Default to UAE
                        value={field.value}
                        onChange={(phone) => {
                          field.onChange(phone);
                          
                          // Validate the phone number as it changes
                          const cc = extractCountryCode(phone);
                          const iso = getISOCountryCode(cc);
                          const result = validatePhoneNumber(phone, iso);
                          
                          // The validation will be handled by the schema
                          form.trigger('mobile_number');
                        }}
                        inputClass="w-full p-2 border rounded"
                        containerClass="w-full"
                        specialLabel=""
                        preferredCountries={['ae', 'sa', 'lk', 'us', 'gb']}
                        enableSearch
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                    {validation.isValid && field.value && (
                      <p className="text-xs text-green-600 mt-1">
                        Valid phone number
                      </p>
                    )}
                  </FormItem>
                );
              }}
            />

              <FormField
                className="w-full"
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm sm:text-base">Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language, index) => (
                          <SelectItem key={index} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveAsDraft}
                  className="w-full sm:w-auto"
                >
                  Save & Close
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add User'
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