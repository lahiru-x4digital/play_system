"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import api from "@/services/api"

export function WalletBalanceEditDialog({ 
  open, 
  onOpenChange, 
  currentBalance = 0,
  customerId,
  onSave 
}) {
  const { data: session, status } = useSession()
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [department, setDepartment] = useState("")
  const [subject, setSubject] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const departmentOptions = ["Care", "Marketing"]
  
  const subjectOptions = {
    "Care": [
      "Food Taste issue",
      "Food Temperature issue",
      "Wrong Order Delivered",
      "Food Presentation issue",
      "Food Portion Size issue",
      "Foreign Object in Food",
      "Undercooked or Overcooked Food",
      "Allergy or Dietary Restriction Not Addressed",
      "Late Order Delivery",
      "Missing Items in Order",
      "Poor Packaging (for delivery/takeaway)",
      "Beverage Quality issue",
      "Rude or Unprofessional Staff Behavior",
      "Long Waiting Time at Restaurant",
      "Incorrect Billing or Overcharge"
    ],
    "Marketing": [
      "Influencer Invite / Complimentary Meal",
      "VIP Guest Complimentary Offer",
      "Management (MD) Special Request",
      "Loyalty Member Reward",
      "Birthday Complimentary Dessert or Meal",
      "Anniversary Complimentary Offer",
      "Customer Retention Gesture",
      "New Menu Promotion Complimentary",
      "Soft Opening Invitation",
      "Special Event Complimentary Invitation",
      "Social Media Giveaway Winner",
      "Apology Gesture for Previous Issue",
      "Community Partner or Charity Support",
      "Press or Media Tasting Invitation",
      "Surprise & Delight Campaign"
    ]
  }
  const [userData, setUserData] = useState(null)
  // Get user data from session when component mounts
  useEffect(() => {
    
    if (status === "authenticated" && session?.user) {
      setUserData({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        userType: session.user.user_type,
        branchId: session.user.branchId,
        branch: session.user.branch
      });
    }
  }, [status, session])


    // Get user data from localStorage and set up listener for updates
   
  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: `Please enter a valid amount`,
        variant: "destructive"
      })
      return
    }

    if (!department) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive"
      })
      return
    }

    if (!subject) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive"
      })
      return
    }


    if (!userData) {
      toast({
        title: "Error",
        description: "User session not found. Please refresh the page.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Prepare the request payload with proper null checks
      const payload = {
        customerId: customerId ? customerId.toString() : '',
        amount: parseFloat(amount) || 0,
        reason: reason || null,
        department: department || null,
        subject: subject || null,
        userId: userData?.id?.toString() || '',
        brandId: userData?.branch?.brandId?.toString() || '',
        branchId: userData?.branchId?.toString() || ''
      }

      // Call the API endpoint
      await api.post('customer/wallet-balance-update', payload)
      // Reset form and close dialog
      setAmount("")
      setReason("")
      setDepartment("")
      setSubject("")
      onOpenChange(false)
      onSave()
      // Show success message
      toast({
        title: "Success",
        description: "Wallet balance updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error updating wallet balance:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet balance. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Wallet Balance</DialogTitle>
          <DialogDescription>
            Update the wallet balance for this customer
          </DialogDescription>
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'}
                  </span>
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1a1 1 0 01-2 0v-1H5a1 1 0 110-2h2V8a1 1 0 112 0v1h2a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      +{parseFloat(amount).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="amount" className="text-right col-span-1 text-sm">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-4"
              placeholder="Enter amount"
              step="0.01"
            />
          </div>
       
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="department" className="text-right col-span-1 text-sm">
              Department <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-4">
            <Select 
              value={department} 
              onValueChange={(value) => {
                setDepartment(value);
                setSubject(""); // Reset subject when department changes
              }}
            >
              <SelectTrigger className="h-10 w-full text-left">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept} className = "cursor-pointer">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="subject" className="text-right col-span-1 text-sm">
              Subject <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-4">
            <Select 
              value={subject} 
              onValueChange={setSubject}
              disabled={!department}
            >
              <SelectTrigger className="h-10 w-full text-left">
                <SelectValue placeholder={department ? "Select subject" : "Select department first"} />
              </SelectTrigger>
              <SelectContent>
                {department && subjectOptions[department]?.map((subj) => (
                  <SelectItem key={subj} value={subj} className = "cursor-pointer">
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>

          <div className="grid grid-cols-5 items-start gap-4">
            <Label htmlFor="reason" className="text-right pt-2 col-span-1 text-sm">
              Additional Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-4"
              placeholder="Enter reason for update"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}