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
import { userService } from "@/services/user.service"
import { customerService } from "@/services/customer.service"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { FormDescription } from "@/components/ui/form"

  const formSchema = z.object({

    branch_id: z.number().min(1, "Branch is required").optional(),

    user_type: z.string()
      .min(1, "User type is required").optional(),

    email: z.string()
      .email("Invalid email address")
      .toLowerCase()
      .optional(),

    first_name: z.string()
      .regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces")
      .optional(),

    last_name: z.string()
      .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces")
      .optional(),

    mobile_number: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number")
      .optional(),

    preferred_language: z.string().optional()
  })



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

export function EditUserForm({ user, onClose, onSuccess }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch_id: user.branch_id || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      mobile_number: user.mobile_number || "",
      preferred_language: user.preferred_language || "",
      user_type: user.user_type || "",
    },
    mode: "onChange"
  })

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

  async function onSubmit(data) {
    try {
      setIsLoading(true)

      // Only include fields that have been changed
      const changedFields = Object.keys(form.formState.dirtyFields).reduce((acc, key) => {
        if (data[key] !== undefined) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No Changes",
          description: "No fields were modified"
        });
        return;
      }

      // Format the data
      const formattedData = {
        ...changedFields,
        branch_id: changedFields.branch_id ? parseInt(changedFields.branch_id, 10) : undefined,
        email: changedFields.email?.toLowerCase(),
      };

      console.log('Submitting data:', formattedData)

      const response = await userService.updateUser(user.id, formattedData)

      if (response.success) {
        toast({
          title: "Success",
          description: "User updated successfully"
        })
        onSuccess?.()
        onClose()
      } else {
        throw new Error(response.message || 'Failed to update user')
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Edit User</DialogTitle>
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

            {/* User Type Field */}
            <FormField
              control={form.control}
              name="user_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">User Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypes.map((userType) => (
                          <SelectItem key={userType.value} value={userType.value}>
                            {userType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Mobile Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={'us'}
                      value={field.value}
                      onChange={(phone) => field.onChange(`${phone}`)}
                      inputStyle={{
                        width: '100%',
                        height: '40px',
                        fontSize: '16px',
                        paddingLeft: '48px',
                      }}
                      buttonStyle={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px 0 0 6px',
                      }}
                      containerStyle={{
                        width: '100%',
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

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
                disabled={isLoading || !form.formState.isDirty}
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