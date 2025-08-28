"use client";
import { useState, useEffect } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { useToast } from "@/hooks/use-toast";
import {  ChevronsUpDown } from "lucide-react";
import SelectBranch from "@/components/common/selectBranch";

const formSchema = z
  .object({
    branch_id: z.coerce.number().min(1, "Branch is required"),
    name: z.string().min(1, "Name is required"),
    start_date: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
        {
          message: "Start date must be today or later",
        }
      ),

    end_date: z.string().min(1, "End date is required"),

    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
  maximum_booking_per_slot: z.coerce.number().min(1, "Maximum booking per slot must be at least 1"),
    slot_booking_period: z.coerce
      .number()
      .min(1, "Slot booking period must be at least 1 minute"),
    price: z.string().optional(),
    is_active: z.boolean().default(true),
    override: z.boolean().default(false),
    days: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    // Validate end date is after start date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (endDate < startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be equal to or after start date",
          path: ["end_date"],
        });
      }
    }

  });

export function AddRuleForm({
  open,
  onOpenChange,
  onSuccess,
  branchId = null,
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      branch_id: branchId,
      start_date: "",
      end_date: "",
      start_time: "09:00",
      end_time: "17:00",
      booking_duration: "60",
      slot_booking_period: "30",
      maximum_booking_per_slot: "1",
      buffer_time: "0",
      price: "",
      is_active: true,
      override: false,
      days: [],
    },
    mode: "onChange",
  });

  const { control, setValue } = form;



  const onSubmit = async (data) => {
    console.log("Form submitted with data:", JSON.stringify(data, null, 2));
    setIsLoading(true);
    try {
      // Clone the data to avoid mutating the original
      const requestData = { ...data };
      // Ensure days is properly formatted as an array
      if (requestData.days && !Array.isArray(requestData.days)) {
        requestData.days = [];
      }
      console.log("Sending to API:", JSON.stringify(requestData, null, 2));

      const response = await bookingService.createReservationRule(requestData);
      // console.log('API Response:', response);
      if (response.success) {
        toast({
          title: "Success",
          description: "Reservation rule created successfully",
        });
        form.reset({
          // Reset form to default values
          name: "",
          start_date: "",
          end_date: "",
          start_time: "09:00",
          end_time: "17:00",
          booking_duration: "60",
          slot_booking_period: "30",
          maximum_booking_per_slot: "1",
          buffer_time: "1",
          price: "",
          is_active: true,
          override: false,
          days: [],
        });
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create availability rule",
      });
    } finally {
      setIsLoading(false);
    }
  };
//watch branch_id
  console.log("Selected branch_id:", form.watch("branch_id"));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Availability Rule</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="branch_id"
              control={form.control}
              rules={{ required: "Branch is required" }}
              render={({ field, fieldState }) => (
                <SelectBranch
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  error={fieldState.error?.message}
                  label="Branch"
                />
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="Enter Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-sm font-normal text-primary hover:bg-transparent"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <ChevronsUpDown />
              {showAdvanced ? "Hide Available Days" : "Show Available Days"}
            </Button>

            {/* Days of Week */}
            {showAdvanced && (
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Days (Optional)</FormLabel>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        "MONDAY",
                        "TUESDAY",
                        "WEDNESDAY",
                        "THURSDAY",
                        "FRIDAY",
                        "SATURDAY",
                        "SUNDAY",
                      ].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={day}
                            checked={field.value?.includes(day)}
                            onChange={(e) => {
                              console.log(
                                "Day checkbox changed:",
                                day,
                                "checked:",
                                e.target.checked
                              );
                              console.log(
                                "Current field value before change:",
                                field.value
                              );
                              if (e.target.checked) {
                                const newValue = [...(field.value || []), day];
                                console.log("Adding day. New value:", newValue);
                                field.onChange(newValue);
                              } else {
                                const newValue = (field.value || []).filter(
                                  (d) => d !== day
                                );
                                console.log(
                                  "Removing day. New value:",
                                  newValue
                                );
                                field.onChange(newValue);
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={day}
                            className="text-sm font-medium text-gray-700"
                          >
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Slot Booking Period */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slot_booking_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Booking Period (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const val =
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value);
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maximum_booking_per_slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Booking Per Slot</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const val =
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value);
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="Enter price" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Override Status */}
            <FormField
              control={form.control}
              name="override"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Override</FormLabel>
                    <FormDescription>
                      When enabled, this rule will override any conflicting
                      rules
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

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this availability rule
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
            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Rule"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
