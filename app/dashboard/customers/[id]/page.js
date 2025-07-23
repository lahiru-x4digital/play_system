"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { customerService } from "@/services/customer.service";
import { discountService } from "@/services/discount.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditCustomerForm } from "@/components/customers/edit-customer-form";
import { DiscountRuleSelector } from "@/components/discount/discount-rule-selector";
import { DiscountCodeSelector } from "@/components/discount/discount-code-selector";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ArrowLeft, Pencil, X, Check, RefreshCcw, SaudiRiyal, History } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; // For custom multi-select
import { WalletBalanceEditDialog } from "@/components/customers/wallet-balance-edit-dialog";
import { MenuItemDiscountSelector } from "@/components/discount/menu-item-discount-selector";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [ruleToReset, setRuleToReset] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [menuItemDiscounts, setMenuItemDiscounts] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [tagDetails, setTagDetails] = useState({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userBranchId, setUserBranchId] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user) {
          setUserBranchId(session.user.branchId);
          setUserType(session.user.user_type);
        }
      } catch (error) {
        console.error('Error getting user session data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
      }
    };

    getUserData();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      const response = await customerService.getCustomerProfileCompletion(params.id);
      if (response.success) {
        setProfileCompletion(response.data.profile_completion_rate);
      } else {
        console.error("Failed to fetch profile completion:", response.message);
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }
  };

  useEffect(() => {
    fetchProfileCompletion();

  }, [customer]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  // Get customer level badge
  const getCustomerLevelBadge = (level) => {
    const colors = {
      VIP: "bg-purple-100 text-purple-800",
      VVIP: "bg-amber-100 text-amber-800",
      Regular: "bg-blue-100 text-blue-800",
      New: "bg-green-100 text-green-800",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  };

  // Fetch customer data
  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const response = await customerService.getCustomerById(params.id);
      if (response.success) {
        setCustomer(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Customer not found",
        });
        router.push("/dashboard/customers");
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load customer details",
      });
      router.push("/dashboard/customers");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tag details
  useEffect(() => {
    if (params.id) {
      fetchCustomerData();
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    async function fetchTagDetails() {
      if (customer?.tags && Array.isArray(customer.tags)) {
        try {
          const response = await customerService.getTags();
          if (response.success) {
            const tagMap = response.data.reduce((acc, tag) => {
              acc[tag.id] = tag;
              return acc;
            }, {});
            setTagDetails(tagMap);
          }
        } catch (error) {
          console.error("Failed to fetch tag details:", error);
        }
      }
    }
    fetchTagDetails();
  }, [customer?.tags]);

  // Fetch discount codes
  useEffect(() => {
    if (customer?.id) {
      fetchDiscountCodes();
      fetchMenuItemDiscounts();
    }
  }, [customer]);

  // Handle adding discount rule
  const handleAddDiscountRule = async (rule) => {
    if (!customer?.id) return;
    setIsUpdating(true);
    try {
      const existingRuleIds = customer.discountRules?.map((dr) => dr.id) || [];
      const updatedRuleIds = [...existingRuleIds, rule.id];
      const response = await customerService.updateCustomer(customer.id, {
        discountRuleIds: updatedRuleIds,
      });
      if (response.success) {
        setCustomer((prev) => ({
          ...prev,
          discountRules: [...(prev.discountRules || []), rule],
        }));
        toast({
          title: "Success",
          description: "Discount rule added successfully",
        });
        fetchCustomerData();
      } else {
        throw new Error(response.message || "Failed to add discount rule");
      }
    } catch (error) {
      console.error("Error adding discount rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add discount rule",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle removing discount rule
  const handleRemoveDiscountRule = async (ruleId) => {
    if (!customer?.id) return;
    setIsUpdating(true);
    try {
      // Send the rule ID as negative to indicate removal
      const response = await customerService.updateCustomer(customer.id, {
        discountRuleIds: [-Math.abs(ruleId)], // Negative ID indicates removal
      });
      if (response.success) {
        setCustomer((prev) => ({
          ...prev,
          discountRules: (prev.discountRules || []).filter((rule) => rule.id !== ruleId),
        }));
        toast({
          title: "Success",
          description: "Discount rule removed successfully",
        });
        fetchCustomerData();
      } else {
        throw new Error(response.message || "Failed to remove discount rule");
      }
    } catch (error) {
      console.error("Error removing discount rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove discount rule",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle refreshing discount rule
  const handleRefreshDiscount = (rule) => {
    setRuleToReset(rule);
    setIsConfirmOpen(true);
  };

  const confirmResetDiscount = async () => {
    if (!ruleToReset) return;

    setIsUpdating(true);
    try {
      // Get the rule code from the rule object
      const ruleCode = ruleToReset.rule?.rule_code || ruleToReset.rule_code;
      if (!ruleCode) {
        throw new Error('Rule code not found');
      }

      const response = await customerService.updateCustomerDiscountRule(
        customer.id,
        ruleToReset.ruleId || ruleToReset.rule?.id,
        {
          eventType: 'reset Discount Rules availability',
          rule_code: ruleCode
        }
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Discount rule has been reset successfully',
        });
        // Refresh customer data
        await fetchCustomerData();
      } else {
        throw new Error(response.message || 'Failed to reset discount rule');
      }
    } catch (error) {
      console.error('Error refreshing discount:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to refresh discount",
      });
    } finally {
      setIsUpdating(false);
      setIsConfirmOpen(false);
      setRuleToReset(null);
    }
  };

  // Get discount rules from customer data
  const discountRules = customer?.discountRules?.map(rule => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    rule_code: rule.rule_code,
    amount: rule.amount,
    percentage: rule.percentage,
    expiry_date: rule.expiry_date,
    required_tags: rule.required_tags,
    limitation: rule.limitation,
    max_uses: rule.max_uses,
    remainings: rule.remaining_uses,
    is_active: rule.is_active || false,
    customers: rule.customers || []
  })) || [];

  // Fetch discount rules
  const fetchDiscountRules = async () => {
    try {
      if (customer?.discountRules && Array.isArray(customer.discountRules)) {
        const rulesWithDetails = customer.discountRules.map((dr) => ({
          id: dr.rule.id,
          name: dr.rule.name,
          description: dr.rule.description,
          rule_code: dr.rule.rule_code,
          amount: dr.rule.amount,
          percentage: dr.rule.percentage,
          expiry_date: dr.rule.expiry_date,
          required_tags: dr.rule.required_tags,
          is_active: dr.rule.is_active || false, // Ensure is_active is included with a default of false if not present
        }));
        setDiscountRules(rulesWithDetails);
      }
    } catch (error) {
      console.error("Error fetching discount rules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discount rules",
      });
    }
  };

  // Fetch discount codes
  const fetchDiscountCodes = async () => {
    try {
      if (customer?.discountCodes && Array.isArray(customer.discountCodes)) {
        const codesWithDetails = customer.discountCodes.map((dc) => ({
          id: dc.discountCode.id,
          name: dc.discountCode.name,
          code: dc.discountCode.code,
          description: dc.discountCode.description,
          amount: dc.discountCode.amount,
          percentage: dc.discountCode.percentage,
          expiry_date: dc.discountCode.expiry_date,
        }));
        setDiscountCodes(codesWithDetails);
      }
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discount codes",
      });
    }
  };

  // Fetch discount codes
  const fetchMenuItemDiscounts = async () => {
    try {
      if (customer?.menuItemDiscounts && Array.isArray(customer.menuItemDiscounts)) {
        const codesWithDetails = customer.menuItemDiscounts.map((dc) => ({
          id: dc.menuItemDiscount.id,
          discount_name: dc.menuItemDiscount.discount_name,
          discount_id: dc.menuItemDiscount.discount_id,
          description: dc.menuItemDiscount.description,
          discount_type: dc.menuItemDiscount.discount_type,
          discount_value: dc.menuItemDiscount.discount_value,
          expiry_date: dc.menuItemDiscount.expiry_date,
          is_active: dc.menuItemDiscount.is_active, // Ensure is_active is included
        }));
        setMenuItemDiscounts(codesWithDetails);
      }
    } catch (error) {
      console.error("Error fetching menu item discounts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load menu item discounts",
      });
    }
  };

  // Handle adding discount code
  const handleAddDiscountCode = async (code) => {
    if (!customer?.id) return;
    setIsUpdating(true);
    try {
      const existingCodeIds = customer.discountCodes?.map((dc) => dc.discountCode.id) || [];
      const updatedCodeIds = [...existingCodeIds, code.id];
      console.log('Updated code IDs:-------------', updatedCodeIds);
      const response = await customerService.updateCustomer(customer.id, {
        discountCodeIds: updatedCodeIds,
      });
      if (response.success) {
        setDiscountCodes((prev) => [...prev, code]);
        toast({
          title: "Success",
          description: "Discount code added successfully",
        });
        fetchCustomerData();
      } else {
        throw new Error(response.message || "Failed to add discount code");
      }
    } catch (error) {
      console.error("Error adding discount code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add discount code",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMenuItemDiscount = async (discount) => {
    if (!customer?.id) return;
    setIsUpdating(true);
    try {
      const existingDiscountIds = customer.menuItemDiscounts?.map((dc) => dc.menuItemDiscount.id) || [];
      const updatedDiscountIds = [...existingDiscountIds, discount.id];
      console.log('Selected discount:-------', updatedDiscountIds)
      const response = await customerService.updateCustomer(customer.id, {
        menuItemDiscountIds: updatedDiscountIds,
      });
      if (response.success) {
        setMenuItemDiscounts((prev) => [...prev, discount]);
        toast({
          title: "Success",
          description: "Menu Item Discount added successfully",
        });
        fetchCustomerData();
      } else {
        throw new Error(response.message || "Failed to add menu item discount");
      }
    } catch (error) {
      console.error("Error adding menu item discount:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add menu item discount",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle removing discount code
  const handleRemoveDiscountCode = async (codeId) => {
    if (!customer?.id) return;
    setIsUpdating(true);
    try {
      const existingCodeIds = customer.discountCodes?.map((dc) => dc.discountCode.id) || [];
      const updatedCodeIds = existingCodeIds.filter((id) => id !== codeId);
      const response = await customerService.updateCustomer(customer.id, {
        discountCodeIds: updatedCodeIds,
      });
      if (response.success) {
        setDiscountCodes((prev) => prev.filter((code) => code.id !== codeId));
        toast({
          title: "Success",
          description: "Discount code removed successfully",
        });
        fetchCustomerData();
      } else {
        throw new Error(response.message || "Failed to remove discount code");
      }
    } catch (error) {
      console.error("Error removing discount code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove discount code",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle removing discount code
  const handleRemoveMenuItemDiscount = async (discountId) => {
    if (!customer?.id) return;
    setIsUpdating(true);
    try {
      const existingDiscountIds = customer.menuItemDiscounts?.map((dc) => dc.menuItemDiscount.id) || [];
      const updatedDiscountIds = existingDiscountIds.filter((id) => id !== discountId);
      const response = await customerService.updateCustomer(customer.id, {
        menuItemDiscountIds: updatedDiscountIds,
      });
      if (response.success) {
        setMenuItemDiscounts((prev) => prev.filter((discount) => discount.id !== discountId));
        toast({
          title: "Success",
          description: "Menu Item Discount removed successfully",
        });
        fetchCustomerData();
      } else {
        throw new Error(response.message || "Failed to remove menu item discount");
      }
    } catch (error) {
      console.error("Error removing menu item discount:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove menu item discount",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle edit success
  const handleEditSuccess = (updatedCustomer) => {
    setCustomer((prev) => ({
      ...prev,
      ...updatedCustomer,
    }));
    setShowEditForm(false);
    toast({
      title: "Success",
      description: "Customer information updated successfully",
    });
    fetchCustomerData();
  };

  // Handle update wallet balance
  const handleUpdateWalletBalance = async () => {
    try {
      // Refresh both customer data and profile completion
      await Promise.all([
        fetchCustomerData(),
        fetchProfileCompletion()
      ]);

      toast({
        title: "Success",
        description: "Wallet balance updated successfully",
      });
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update wallet balance",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10 px-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  // Personal Info Tab
  const PersonalInfoTab = () => (
    <div className="space-y-6">
      {/* Account Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">
                    {customer.total_points_balance || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Points Balance</p>
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {customer.point_to_cash_balance || 0}<SaudiRiyal />
                  </div>
                  <p className="text-sm text-muted-foreground">Points to Cash</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold flex items-center gap-2 justify-center">{customer.wallet_balance || 0}<SaudiRiyal /></div>
              <p className="text-sm text-muted-foreground flex items-center justify-center">Wallet Balance</p>
              {(userType === 'SUPERADMIN' || userType === 'ORGANIZATION_USER') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit wallet balance</span>
                </Button>
              )}

            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold flex items-center gap-2 justify-center">{customer.total_spent || 0}<SaudiRiyal /></div>
              <p className="text-sm text-muted-foreground flex items-center justify-center">Total Spent</p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${customer.total_Redeem_Amount}
              </div>
              <p className="text-sm text-muted-foreground">Total Redeemed</p>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="text-base">{`${customer.first_name || ""} ${customer.last_name || ""}`}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-base">{customer.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mobile Number</label>
                <p className="text-base">{customer.mobile_number}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Birthdate</label>
                <p className="text-base">
                  {customer.birthdate ? formatDate(customer.birthdate) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Gender</label>
                <p className="text-base">{customer.gender || "-"}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={profileCompletion}
                text={`${profileCompletion}%`}
                styles={buildStyles({
                  rotation: 0,
                  strokeLinecap: "round",
                  textSize: "16px",
                  pathTransitionDuration: 0.5,
                  pathColor: `rgba(62, 152, 199, ${profileCompletion / 100})`,
                  textColor: "#3e98c7",
                  trailColor: "#d6d6d6",
                  backgroundColor: "#3e98c7",
                })}
              />
            </div>
            <p className="mt-2 text-sm text-center text-muted-foreground">
              Profile Completion
            </p>
          </div>
        </div>
      </div>

      {/* Customer Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">
              Member Tier
            </label>
            <div>
              <Badge className={getCustomerLevelBadge(customer.customer_level)}>
                {customer.customer_level}
              </Badge>
            </div>
          </div>
          {/* <div>
            <label className="text-sm text-muted-foreground">Preferred Language</label>
            <p className="text-base">{customer.preferred_language || "-"}</p>
          </div> */}
          <div>
            <label className="text-sm text-muted-foreground">
              Preferred Language
            </label>
            <p className="text-base">{customer.preferred_language || "-"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">
              Customer Type
            </label>
            <p className="text-base">{customer.customer_type || "-"}</p>
          </div>
          {customer.customer_type === 'INDPT - Family' && (
            <div>
              <label className="text-sm text-muted-foreground">Employee ID</label>
              <p className="text-base">{customer.employee_id || '-'}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-muted-foreground">Joined Source</label>
            <p className="text-base">{customer.branch?.branch_name || "-"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Joined Date</label>
            <p className="text-base">{formatDate(customer.created_date)}</p>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Communication Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">WhatsApp</label>
            <div className="mt-1">
              <Badge
                variant={customer.isWhatsApp ? "default" : "secondary"}
                className={
                  customer.isWhatsApp
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : ""
                }
              >
                {customer.isWhatsApp ? "Subscribed" : "Unsubscribed"}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">SMS</label>
            <div className="mt-1">
              <Badge
                variant={customer.isSMS ? "default" : "secondary"}
                className={
                  customer.isSMS ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""
                }
              >
                {customer.isSMS ? "Subscribed" : "Unsubscribed"}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <div className="mt-1">
              <Badge
                variant={customer.isEmail ? "default" : "secondary"}
                className={
                  customer.isEmail
                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    : ""
                }
              >
                {customer.isEmail ? "Subscribed" : "Unsubscribed"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tags</h3>
        <div>
          {Array.isArray(customer?.tags) && customer.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag, index) => (
                <Badge
                  key={`customer-tag-${tag.id || index}`}
                  variant="secondary"
                  className="px-2 py-1"
                >
                  {tagDetails[tag.id]?.name || "Loading..."}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags assigned</p>
          )}
        </div>
      </div>
    </div>
  );

  // Discounts Tab
  const DiscountsTab = () => (
    <div className="space-y-6">
      {/* Discount Rules Section */}
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Available Discount Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {console.log('Discount Rules:', discountRules)}
              {discountRules.length > 0 ? (
                discountRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="w-full">
                          <h4 className="font-semibold">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                          {rule.amount ? (
                            <div className="mt-2">
                              <span className="text-sm font-medium">
                                Discount Amount: ${rule.amount}
                              </span>
                            </div>
                          ) : rule.percentage ? (
                            <div className="mt-2">
                              <span className="text-sm font-medium">
                                Discount: {rule.percentage}%
                              </span>
                            </div>
                          ) : null}
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              Code: {rule.rule_code}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              {(() => {
                                console.log('Rule:', rule.rule_code, 'Full customers array:', rule.customers);
                                const currentCustomerId = parseInt(params.id);
                                console.log('Current customer ID from URL:', currentCustomerId, 'Type:', typeof currentCustomerId);

                                console.log('=== Debugging Discount Rule ===');
                                console.log('Rule object:', JSON.parse(JSON.stringify(rule)));

                                // Log full rule object structure
                                console.log('=== Full Rule Object ===');
                                console.log('Rule keys:', Object.keys(rule));
                                console.log('Rule properties:');
                                Object.entries(rule).forEach(([key, value]) => {
                                  console.log(`- ${key}:`, value);
                                });

                                const customerDiscount = rule.customers?.find(c => c.customer_id === currentCustomerId);
                                console.log('Found customer discount:', JSON.parse(JSON.stringify(customerDiscount)));

                                const isAvailable = customerDiscount?.availability === true;
                                const remainingUses = customerDiscount?.remaining_uses;


                                console.log('limitation check', rule.limitation)
                                // Check if the rule has a limitation (default to true if not specified)
                                const hasLimitation = rule.limitation !== false; // true if undefined or true, false only if explicitly false

                                console.log('limitation', hasLimitation)
                                return isAvailable
                                  ? !hasLimitation || remainingUses > 0
                                    ? !hasLimitation
                                      ? 'Available Now (Unlimited)'
                                      : `Available Now (${remainingUses} remaining)`
                                    : 'Available Now (0 remaining)'
                                  : 'Not Available Now';
                              })()}
                            </span>

                          </div>
                          {rule.expiry_date && (
                            <div className="mt-1">
                              <span className="text-sm text-muted-foreground">
                                Expires: {formatDate(rule.expiry_date)}
                              </span>
                            </div>
                          )}
                          {rule.required_tags && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">
                                Required Tags: {rule.required_tags.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-between gap-14">
                          <div className="flex flex-col items-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveDiscountRule(rule.id)}
                              disabled={isUpdating}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Badge
                              variant={rule.is_active ? "default" : "secondary"}
                              className={rule.is_active
                                ? "bg-green-600"
                                : "bg-gray-200"
                              }>{rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefreshDiscount(rule);
                            }}
                            className="cursor-pointer"
                            title="Refresh discount"
                          >
                            <RefreshCcw className="w-4 h-4 mt-2 text-gray-500 hover:text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No discount rules available for this customer
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <DiscountRuleSelector
              onSelectRule={handleAddDiscountRule}
              customerTags={customer?.tags || []}
              existingRuleIds={discountRules.map((rule) => rule.id)}
            />
          </div>
        </div>
      </div>

      {/* Discount Codes Section */}
      {/* <div className="space-y-4">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Available Discount Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {discountCodes.length > 0 ? (
                discountCodes.map((code) => (
                  <Card key={code.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{code.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {code.description}
                          </p>
                          {code.amount ? (
                            <div className="mt-2">
                              <span className="text-sm font-medium">
                                Discount Amount: ${code.amount}
                              </span>
                            </div>
                          ) : code.percentage ? (
                            <div className="mt-2">
                              <span className="text-sm font-medium">
                                Discount: {code.percentage}%
                              </span>
                            </div>
                          ) : null}
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              Code: {code.code}
                            </span>
                          </div>
                          {code.expiry_date && (
                            <div className="mt-1">
                              <span className="text-sm text-muted-foreground">
                                Expires: {formatDate(code.expiry_date)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={code.is_active ? "success" : "secondary"}>
                            {code.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveDiscountCode(code.id)}
                            disabled={isUpdating}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No discount codes available for this customer
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <DiscountCodeSelector
              onSelectCode={handleAddDiscountCode}
              existingCodeIds={discountCodes.map((code) => code.id)}
            />
          </div>
        </div>
      </div> */}

      {/* Menu Item Discount Section */}
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Available Menu Item Discounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {menuItemDiscounts.length > 0 ? (
                menuItemDiscounts.map((discount) => (
                  <Card key={discount.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                      <div>
                          <h4 className="font-semibold">{discount.discount_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {discount.description}
                          </p>
                          <span className="text-sm font-medium">Discount: 
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%` 
                            : `$${discount.discount_value}`}
                        </span>
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              Code: {discount.discount_id}
                            </span>
                          </div>
                          {discount.expiry_date && (
                            <div className="mt-1">
                              <span className="text-sm text-muted-foreground">
                                Expires: {formatDate(discount.expiry_date)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {/* <span className="ml-2">{discount.is_active ? "Active" : "Inactive"}</span> */}
                          {/* <Badge variant={discount.is_active ? "success" : "secondary"}>
                            {discount.is_active ? "Active" : "Inactive"}
                          </Badge> */}
                          <Badge
                              variant={discount.is_active ? "default" : "secondary"}
                              className={discount.is_active
                                ? "bg-green-600"
                                : "bg-gray-200"
                              }>{discount.is_active ? "Active" : "Inactive"}
                            </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveMenuItemDiscount(discount.id)}
                            disabled={isUpdating}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No discount codes available for this customer
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <MenuItemDiscountSelector
              onSelectDiscount={handleAddMenuItemDiscount}
              existingDiscountIds={menuItemDiscounts.map((discount) => discount.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-10 px-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/customers")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-bold">Customer Details</CardTitle>
          </div>
        <div className="flex items-center gap-2">
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditForm(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/customers/${customer.id}/history?mobile=${customer.mobile_number}`)}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {(userType === 'SUPERADMIN') && (
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
            </TabsList>
            )}
            <TabsContent value="personal">
              <PersonalInfoTab />
            </TabsContent>
            
            <TabsContent value="discounts">
              <DiscountsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showEditForm && customer && (
        <EditCustomerForm
          customer={{
            ...customer,
            tags: customer.tags?.map((tag) => tag.tag_id) || [],
            tagNames:
              customer.tags?.map((tag) => tagDetails[tag.tag_id]?.name || "") || [],
            customer_type: customer.customer_type,
          }}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleEditSuccess}
          isDetailsPage={true}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Discount Rule</DialogTitle>
            <div className="space-y-2">
              <DialogDescription>
                Are you sure you want to reset the discount rule "{ruleToReset?.rule?.name || ruleToReset?.name}"?
              </DialogDescription>
              <DialogDescription>
                This will make the discount available for use again.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmResetDiscount}
              disabled={isUpdating}
            >
              {isUpdating ? 'Resetting...' : 'Confirm Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WalletBalanceEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentBalance={customer.wallet_balance || 0}
        customerId={customer.id}
        onSave={handleUpdateWalletBalance}
      />
    </div>
  );
}