"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { customerService } from "@/services/customer.service";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  validatePhoneNumber,
  formatPhoneNumberAsYouType,
  extractCountryCode,
  getISOCountryCode,
} from "@/utils/phone-validation";
import { PhoneNumberField } from "./coustomer-mobile-input";

const formSchema = z.object({
  mobile_number: z
    .string()
    .min(1, "Mobile number is required")
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
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  birthdate: z.string().refine((date) => {
    if (!date) return true; // Allow empty
    const selectedDate = new Date(date);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 18);
    return selectedDate <= minDate;
  }, "Customer must be at least 18 years old"),
  customer_level: z.string().optional(),
  preferred_language: z.string().optional(),
  isWhatsApp: z.boolean().default(true),
  isSMS: z.boolean().default(true),
  isEmail: z.boolean().default(true),
});

const languages = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

export function AddCustomerForm({ open, onOpenChange, onSuccess }) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthdate: "",
      customer_level: "BRONZE",
      email: "",
      first_name: "",
      last_name: "",
      mobile_number: "",
      preferred_language: "",
      isWhatsApp: true,
      isSMS: true,
      isEmail: true,
    },
    mode: "all",
  });

  const onFormSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Validate phone number before proceeding
      const countryCode = extractCountryCode(data.mobile_number);
      const isoCode = getISOCountryCode(countryCode);
      const phoneValidation = validatePhoneNumber(data.mobile_number, isoCode);

      if (!phoneValidation.isValid) {
        toast({
          title: "Validation Error",
          description: phoneValidation.error || "Invalid phone number format",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!session?.user?.branchId) {
        toast({
          title: "Error",
          description:
            "No branch assigned to your account. Please contact your administrator.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Format the data
      const customerData = {
        mobile_number: data.mobile_number.replace(/\D/g, ""),
        email: data.email?.toLowerCase(),
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        birthdate: data.birthdate
          ? new Date(data.birthdate).toISOString()
          : undefined,
        customer_level: data.customer_level || "WHITE",
        branch_id: parseInt(session.user.branchId, 10),
        preferred_language: data.preferred_language || undefined,
        joined_source: "restroengage_dashboard",
        isWhatsApp: data.isWhatsApp,
        isSMS: data.isSMS,
        isEmail: data.isEmail,
      };

      // Remove any undefined values
      const formattedData = Object.fromEntries(
        Object.entries(customerData).filter(
          ([_, value]) => value !== undefined && value !== "" && value !== null
        )
      );

      console.log("Sending customer data:", formattedData);
      const response = await customerService.createCustomer(formattedData);
      console.log("Create customer response:", response);

      if (response.success) {
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
        clearDraft();
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response.message || "Failed to create customer");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create customer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("customerFormDraft");
    form.reset({
      birthdate: "",
      customer_level: "BRONZE",
      email: "",
      first_name: "",
      last_name: "",
      mobile_number: "",
      preferred_language: "",
    });
  };

  const handleClose = (saveDraft) => {
    if (saveDraft) {
      const formData = form.getValues();
      localStorage.setItem("customerFormDraft", JSON.stringify(formData));
    } else {
      clearDraft();
    }
    onOpenChange(false);
  };

  const handleSaveAsDraft = () => {
    const formData = form.getValues();
    localStorage.setItem("customerFormDraft", JSON.stringify(formData));
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      const savedDraft = localStorage.getItem("customerFormDraft");
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        form.reset(draft);
      }
    } else {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Add New Customer
          </DialogTitle>
          <DialogDescription>
            Create a new customer. Mobile number is required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 py-4">
            {/* Name Fields - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      First Name
                    </FormLabel>
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
                    <FormLabel className="text-sm sm:text-base">
                      Last Name
                    </FormLabel>
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
            <PhoneNumberField
              control={form.control}
              name="mobile_number"
              defaultCountry="ae"
              preferred={["ae", "sa", "lk", "us", "gb"]}
              description="Enter phone number with country code (e.g. +971 …)"
            />
            {/* Mobile Number */}
            {/* <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => {
                const countryCode = field.value
                  ? extractCountryCode(field.value)
                  : "971";
                const isoCode = getISOCountryCode(countryCode);
                const validation = validatePhoneNumber(field.value, isoCode);

                return (
                  <FormItem>
                    <FormLabel
                      data-phone-label
                      className={`text-sm sm:text-base ${
                        !validation.isValid ? "text-red-500 font-medium" : ""
                      }`}
                    >
                      Mobile Number*
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneInput
                          country={"ae"}
                          value={field.value}
                          onChange={(phone, countryData) => {
                            // Get the country code from the selected country
                            const countryCode = countryData.dialCode;
                            const isoCode = getISOCountryCode(countryCode);

                            // Validate the phone number
                            const validation = validatePhoneNumber(
                              phone,
                              isoCode
                            );

                            // Update the form field
                            field.onChange(phone);

                            // Set error in form state if number is invalid
                            if (!validation.isValid) {
                              form.setError("mobile_number", {
                                type: "manual",
                                message: validation.error,
                              });
                            } else {
                              form.clearErrors("mobile_number");
                            }

                            // Update validation state immediately
                            const labelElement =
                              document.querySelector("[data-phone-label]");
                            const messageElement = document.querySelector(
                              "[data-phone-validation-message]"
                            );

                            if (!validation.isValid) {
                              if (labelElement) {
                                labelElement.classList.add(
                                  "text-red-500",
                                  "font-medium"
                                );
                              }
                              if (messageElement) {
                                messageElement.textContent = validation.error;
                                messageElement.className =
                                  "text-xs mt-1 text-red-500 font-medium";
                              }
                            } else {
                              if (labelElement) {
                                labelElement.classList.remove(
                                  "text-red-500",
                                  "font-medium"
                                );
                              }
                              if (messageElement) {
                                messageElement.textContent = "";
                                messageElement.className = "text-xs mt-1";
                              }
                            }
                          }}
                          inputClass={`w-full p-2 border rounded ${
                            !validation.isValid
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          containerClass="w-full"
                          buttonClass={
                            !validation.isValid ? "border-red-500" : ""
                          }
                          dropdownStyle={{ zIndex: 50 }}
                          specialLabel=""
                          enableSearch={true}
                          disableSearchIcon={true}
                          searchPlaceholder="Search country..."
                          preferredCountries={["ae", "sa", "lk", "us", "gb"]}
                          enableAreaCodes={true}
                        />
                        <div
                          data-phone-validation-message
                          className={`text-xs mt-1 ${
                            validation.isValid ? "" : "text-red-500 font-medium"
                          }`}
                        >
                          {validation.error || ""}
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

            {/* Language and Birthdate - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Language
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => {
                  const maxDate = new Date();
                  maxDate.setFullYear(maxDate.getFullYear() - 18);
                  const maxDateString = maxDate.toISOString().split("T")[0];
                  return (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Birthdate
                      </FormLabel>
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

            {/* Customer Level */}
            <FormField
              control={form.control}
              name="customer_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Customer Level
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="WHITE" value="WHITE">
                        White
                      </SelectItem>
                      <SelectItem key="GRAY" value="GRAY">
                        Gray
                      </SelectItem>
                      <SelectItem key="BLACK" value="BLACK">
                        Black
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-medium">
                Communication Preferences
              </h3>
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
                  type="button"
                  onClick={async () => {
                    const formData = form.getValues();
                    await onFormSubmit(formData);
                  }}
                  disabled={
                    isLoading ||
                    !form.formState.isValid ||
                    form.formState.errors.mobile_number !== undefined
                  }
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Customer"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
