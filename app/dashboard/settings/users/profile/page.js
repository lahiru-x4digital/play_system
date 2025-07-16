"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  User,
  Lock,
  Settings
} from "lucide-react";
import {
  validatePhoneNumber,
  extractCountryCode,
  getISOCountryCode,
} from "@/utils/phone-validation";
import { userService } from "@/services/user.service";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const languages = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

const formSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  mobile_number: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (val) => {
        if (!val || val.trim() === "") return false; // Empty is invalid
        const countryCode = extractCountryCode(val);
        const isoCode = getISOCountryCode(countryCode);
        const validation = validatePhoneNumber(val, isoCode);
        return validation.isValid;
      },
      (val) => {
        if (!val || val.trim() === "")
          return { message: "Mobile number is required" };
        const countryCode = extractCountryCode(val);
        const isoCode = getISOCountryCode(countryCode);
        const validation = validatePhoneNumber(val, isoCode);
        return {
          message: validation.error || "Please enter a valid phone number",
        };
      }
    ), preferred_language: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "Password is too long"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Two-Factor Authentication states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    security: false,
    twoFactor: false,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile_number: "",
      preferred_language: "",
    },
    mode: "onBlur", // Only validate when user leaves field or on submit
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);

        let userId = null;
        let userProfile = null;

        // Get user ID from localStorage
        try {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          userId = userData?.user?.id;
        } catch (e) {
          console.warn("Failed to parse userData from localStorage:", e);
        }

        // If no user ID found, try to get from session
        if (!userId && session?.user?.id) {
          userId = session.user.id;
          console.log("Using user ID from session:", userId);
        }

        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        const result = await userService.getUserById(userId);

        if (result.success && result.data) {
          userProfile = result.data;

          // Update localStorage with the complete fresh data
          try {
            const userData = JSON.parse(
              localStorage.getItem("userData") || "{}"
            );
            const updatedUserData = {
              ...userData,
              user: {
                ...userData.user,
                ...userProfile,
                id: userId, // Ensure ID is preserved
              },
            };
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
          } catch (e) {
            console.warn("Failed to update localStorage with fresh data:", e);
          }
        } else {
          throw new Error(
            result.message || "Failed to load user profile from database"
          );
        }

        // Populate the form with complete user data
        if (userProfile) {
          form.reset({
            first_name: userProfile.first_name || "",
            last_name: userProfile.last_name || "",
            email: userProfile.email || "",
            mobile_number: userProfile.mobile_number || "",
            preferred_language: userProfile.preferred_language || "",
          });

          // Load 2FA status using dedicated method
          try {
            const twoFactorStatus = await userService.get2FAStatus(userId);
            if (twoFactorStatus.success) {
              setIs2FAEnabled(twoFactorStatus.data.is2FAEnabled);
            } else {
              // Fallback to profile data
              const is2FAActive = userProfile.is2fa || false;

              console.log('Using fallback 2FA status from profile:', is2FAActive);
              setIs2FAEnabled(is2FAActive);
            }
          } catch (error) {
            console.warn('Failed to load 2FA status, using profile fallback:', error);
            // Fallback to profile data
            const is2FAActive = userProfile.is2fa || false;

            setIs2FAEnabled(is2FAActive);
          }
        }
      } catch (error) {
        console.error("Profile load error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Load profile when component mounts or when session changes
    if (session) {
      loadUserProfile();
    }
  }, [session]); // Only depend on session, not form or toast

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      // Try to get user ID from multiple sources
      let userId = null;

      // Method 1: Get from localStorage userData
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userId = userData?.user?.id;
      } catch (e) {
        console.warn("Failed to parse userData from localStorage:", e);
      }

      // Method 2: If not found, try to get from session
      if (!userId && session?.user?.id) {
        userId = session.user.id;
      }

      // Method 3: If still not found, try other localStorage keys
      if (!userId) {
        try {
          const userDataAlt = JSON.parse(localStorage.getItem("user") || "{}");
          userId = userDataAlt?.id;
        } catch (e) {
          console.warn("Failed to parse user from localStorage:", e);
        }
      }

      if (!userId) {
        console.error("No user ID found in any location:", {
          localStorage_userData: localStorage.getItem("userData"),
          localStorage_user: localStorage.getItem("user"),
          session: session,
        });
        throw new Error("User session not found. Please log in again.");
      }

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
        setIsSaving(false);
        return;
      }

      // Format the data like in other working components
      const formattedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== "" && value !== null
        )
      );

      // Format mobile number by removing non-digits
      if (formattedData.mobile_number) {
        formattedData.mobile_number = formattedData.mobile_number.replace(
          /\D/g,
          ""
        );
      }
      console.log(
        "Updating profile for user ID:",
        userId,
        "with data:",
        formattedData
      );

      // Use the userService to update the profile
      const result = await userService.updateUser(userId, formattedData);

      if (!result.success) {
        throw new Error(result.message || "Failed to update profile");
      }
      console.log("Profile update successful:", result);

      // ALWAYS fetch fresh complete data from database after update
      console.log("Fetching updated complete profile data from database...");
      const freshResult = await userService.getUserById(userId);

      if (freshResult.success && freshResult.data) {
        const freshProfile = freshResult.data;
        console.log("Got fresh complete profile data:", freshProfile);

        // Update localStorage with complete fresh data from database
        try {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          const updatedUserData = {
            ...userData,
            user: {
              ...userData.user,
              ...freshProfile,
              id: userId, // Ensure ID is preserved
            },
          };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
          console.log("Updated localStorage with fresh complete backend data");
        } catch (e) {
          console.warn("Failed to update localStorage with fresh data:", e);
        }

        // Update the form with fresh complete data to show immediate changes
        form.reset({
          first_name: freshProfile.first_name || "",
          last_name: freshProfile.last_name || "",
          email: freshProfile.email || "",
          mobile_number: freshProfile.mobile_number || "",
          preferred_language: freshProfile.preferred_language || "",
        });
        console.log("Form updated with fresh complete profile data");
      } else {
        console.warn(
          "Failed to fetch fresh profile data after update, using submitted data as fallback"
        );
        // Fallback: update localStorage with the submitted data
        try {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          const updatedUserData = {
            ...userData,
            user: {
              ...userData.user,
              ...formattedData,
              id: userId, // Ensure ID is preserved
            },
          };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        } catch (e) {
          console.warn("Failed to update localStorage:", e);
        }
      }

      // Also update session if using NextAuth
      if (session?.user) {
        // Trigger session update - this will update the session on the client
        try {
          await fetch("/api/auth/session?update", {
            method: "GET",
          });
        } catch (e) {
          console.warn("Failed to update session:", e);
        }
      }

      // Show success toast after everything is completed
      console.log("About to show success toast...");
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      console.log("Success toast called");
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setIsChangingPassword(true);

      // Get the access token from the session
      if (!session?.accessToken) {
        throw new Error("Authentication session expired. Please log in again.");
      }

      console.log("Changing password with JWT authentication");

      // Use the userService to change password with accessToken from session
      const result = await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        accessToken: session.accessToken
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to change password");
      }

      console.log("Password change successful:", result);

      // Reset the password form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Show success toast
      toast({
        title: "Success",
        description: result.message || "Password changed successfully!",
      });

    } catch (error) {
      console.error("Password change error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handle2FAEnable = async () => {
    try {
      setIsEnabling2FA(true);

      // Get user ID from multiple sources
      let userId = null;
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userId = userData?.user?.id;
      } catch (e) {
        console.warn("Failed to parse userData from localStorage:", e);
      }

      if (!userId && session?.user?.id) {
        userId = session.user.id;
      }

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      console.log('Enabling 2FA for user ID:', userId);

      // Use dedicated 2FA enable method
      const result = await userService.enable2FA(userId);

      if (!result.success) {
        throw new Error(result.message || "Failed to enable 2FA");
      }

      console.log('2FA enable result:', result);

      setIs2FAEnabled(true);

      // Update localStorage to reflect 2FA status
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
            is2fa: true
          },
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } catch (e) {
        console.warn("Failed to update localStorage with 2FA status:", e);
      }

      toast({
        title: "Success",
        description: "Two-Factor Authentication has been enabled successfully!",
      });

    } catch (error) {
      console.error("2FA enable error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to setup 2FA",
      });
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handle2FADisable = async () => {
    try {
      setIsDisabling2FA(true);

      // Get user ID from multiple sources
      let userId = null;
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userId = userData?.user?.id;
      } catch (e) {
        console.warn("Failed to parse userData from localStorage:", e);
      }

      if (!userId && session?.user?.id) {
        userId = session.user.id;
      }

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Use dedicated 2FA disable method
      const result = await userService.disable2FA(userId);

      if (!result.success) {
        throw new Error(result.message || "Failed to disable 2FA");
      }

      console.log('2FA disable result:', result);

      setIs2FAEnabled(false);

      // Update localStorage to reflect 2FA status
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
            is2fa: false
          },
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } catch (e) {
        console.warn("Failed to update localStorage with 2FA status:", e);
      }

      toast({
        title: "Success",
        description: "Two-Factor Authentication has been disabled.",
      });

    } catch (error) {
      console.error("2FA disable error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to disable 2FA",
      });
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handle2FAToggle = async (enabled) => {
    if (enabled && !is2FAEnabled) {
      // User wants to enable 2FA
      await handle2FAEnable();
    } else if (!enabled && is2FAEnabled) {
      // User wants to disable 2FA
      await handle2FADisable();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and security settings
          </p>
        </div>

        {/* Personal Information Section */}
        <Card className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
            onClick={() => toggleSection('personalInfo')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg font-medium">Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {expandedSections.personalInfo ? 'Collapse' : 'Expand'}
                </span>
                {expandedSections.personalInfo ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                )}
              </div>
            </div>
          </CardHeader>

          <div className={`transition-all duration-300 ease-in-out ${expandedSections.personalInfo
            ? 'max-h-[2000px] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
            <CardContent className="pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={
                              form.formState.errors.first_name
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            First Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              className={
                                form.formState.errors.first_name
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={
                              form.formState.errors.last_name
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            Last Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              className={
                                form.formState.errors.last_name
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={
                            form.formState.errors.email
                              ? "text-red-500 font-medium"
                              : ""
                          }
                        >
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            className={
                              form.formState.errors.email
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile_number"
                    render={({ field }) => {
                      const countryCode = field.value
                        ? extractCountryCode(field.value)
                        : "971";
                      const isoCode = getISOCountryCode(countryCode);
                      const validation =
                        field.value && field.value.trim() !== ""
                          ? validatePhoneNumber(field.value, isoCode)
                          : { isValid: true, error: "" };
                      const hasError = form.formState.errors.mobile_number;
                      return (
                        <FormItem>
                          <FormLabel
                            className={hasError ? "text-red-500 font-medium" : ""}
                          >
                            Mobile Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <PhoneInput
                                country={"ae"}
                                value={field.value}
                                onChange={(phone, countryData) => {
                                  field.onChange(phone);
                                  if (phone && phone.trim() !== "") {
                                    const validation = validatePhoneNumber(
                                      phone,
                                      countryData.countryCode.toUpperCase()
                                    );
                                    if (!validation.isValid) {
                                      console.log("Phone validation error:", validation.error);
                                    }
                                  } else {
                                    console.log("Phone cleared");
                                  }
                                }}
                                inputClass={`w-full p-2 border rounded ${hasError
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : ""
                                  }`}
                                containerClass="w-full"
                                buttonClass={hasError ? "border-red-500" : ""}
                                dropdownStyle={{ zIndex: 50 }}
                                specialLabel=""
                                enableSearch={true}
                                disableSearchIcon={true}
                                searchPlaceholder="Search country..."
                                preferredCountries={[
                                  "ae",
                                  "sa",
                                  "lk",
                                  "us",
                                  "gb",
                                ]}
                                enableAreaCodes={true}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            {`Enter phone number with country code (e.g., +${countryCode} ...)`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="preferred_language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem
                                key={language.value}
                                value={language.value}
                              >
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred language for communications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <div className="flex-1">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => (window.location.href = "/dashboard")}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </div>
        </Card>

        {/* Security Settings Section */}
        <Card className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
            onClick={() => toggleSection('security')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg font-medium">Security Settings</CardTitle>
                  <CardDescription>Update your account password for enhanced security</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {expandedSections.security ? 'Collapse' : 'Expand'}
                </span>
                {expandedSections.security ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                )}
              </div>
            </div>
          </CardHeader>

          <div className={`transition-all duration-300 ease-in-out ${expandedSections.security
            ? 'max-h-[1500px] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
            <CardContent className="pt-0">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={
                            passwordForm.formState.errors.currentPassword
                              ? "text-red-500 font-medium"
                              : ""
                          }
                        >
                          Current Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              {...field}
                              disabled={isChangingPassword}
                              className={
                                passwordForm.formState.errors.currentPassword
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : ""
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              disabled={isChangingPassword}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={
                              passwordForm.formState.errors.newPassword
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            New Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                {...field}
                                disabled={isChangingPassword}
                                className={
                                  passwordForm.formState.errors.newPassword
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : ""
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                disabled={isChangingPassword}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Password must be at least 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={
                              passwordForm.formState.errors.confirmPassword
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            Confirm New Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...field}
                                disabled={isChangingPassword}
                                className={
                                  passwordForm.formState.errors.confirmPassword
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : ""
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isChangingPassword}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <div className="flex-1">
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full"
                      >
                        {isChangingPassword ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Changing...</span>
                          </div>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          passwordForm.reset({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="w-full"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </div>
        </Card>

        {/* Two-Factor Authentication Section */}
        <Card className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
            onClick={() => toggleSection('twoFactor')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {is2FAEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <Shield className="h-5 w-5 text-primary" />
                )}
                <div>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    Two-Factor Authentication
                    {is2FAEnabled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Enabled
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account with two-factor authentication
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {expandedSections.twoFactor ? 'Collapse' : 'Expand'}
                </span>
                {expandedSections.twoFactor ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                )}
              </div>
            </div>
          </CardHeader>

          <div className={`transition-all duration-300 ease-in-out ${expandedSections.twoFactor
            ? 'max-h-[800px] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* Current Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {is2FAEnabled ? (
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    ) : (
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {is2FAEnabled
                          ? "Your account is protected with two-factor authentication"
                          : "Enable 2FA to secure your account with an authenticator app"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">
                      {is2FAEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={is2FAEnabled}
                      onCheckedChange={handle2FAToggle}
                      disabled={isEnabling2FA || isDisabling2FA}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>

                {/* Loading State for Toggle Actions */}
                {(isEnabling2FA || isDisabling2FA) && (
                  <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                      <span className="text-sm font-medium">
                        {isEnabling2FA ? "Enabling 2FA..." : "Disabling 2FA..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
