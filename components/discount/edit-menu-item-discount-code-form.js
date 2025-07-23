"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { menuItemDiscountService } from "@/services/menu-item-discount.service"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { discountService } from "@/services/discount.service"
import { menuItemService } from "@/services/menu-item.service"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

// Helper function to safely parse numeric values
const formSchema = z.object({
  item_discount_code: z.union([
      z.string().transform(val => Number(val)),
      z.number(),
      z.null()
    ]).optional(),
  // item_discount_code: z.string().min(1, "Discount code is required"),

});

export function EditMenuItemDiscountCodeForm({
  open,
  onOpenChange,
  onSuccess,
  initialData
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Initialize form with initial data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_discount_code: "",
    },
    mode: "onChange"
  })


  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      // Transform the data to match the API's expected format
      const formattedData = {
        item_discount_code: data.item_discount_code,
      }

      const response = await menuItemDiscountService.updateMenuItemDiscountCode(
        initialData.id,
        formattedData
      )
      

      if (response.success) {
        toast({
          title: "Success",
          description: "Menu item discount updated successfully"
        })
        onSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(response.message || 'Failed to update discount')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update menu item discount"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Initial data received:', initialData);

      // Prepare form values
      const formValues = {
        item_discount_code: initialData.item_discount_code || "",
      };

      console.log('Setting form values:', formValues);
      form.reset(formValues);
    }
  }, [initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] h-[350px] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Edit Code</DialogTitle>
          <DialogDescription>
            Make changes to your code here. Click update when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="item_discount_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Enter code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="ml-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Code"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 