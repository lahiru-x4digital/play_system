"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/services/api";
import SelectBranch from "../common/selectBranch";
import useSessionUser, { useIsAdmin } from "@/lib/getuserData";
import ReservationRuleSelectInput from "../common/ReservationRuleSelectInput";

const formSchema = z.object({
  play_reservation_rule_id: z.number().min(1, "Reservation rule is required"),
  duration: z
    .number({ invalid_type_error: "Duration is required" })
    .min(1, "Duration must be at least 1"),
  price: z
    .number({ invalid_type_error: "Price is required" })
    .min(0, "Price must be at least 0"),
  branch_id: z.number().min(1, "Branch is required"),
});

const EditExtraPricingDialog = ({ pricing = {}, onSuccess, open, setOpen }) => {
  const isAdmin = useIsAdmin();
  const user = useSessionUser();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      play_reservation_rule_id: pricing.play_reservation_rule_id || "",
      duration: pricing.duration || "",
      price: pricing.price || "",
      is_active: pricing.is_active,
      branch_id: pricing?.PlayReservationRule?.branch_id || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      play_reservation_rule_id: pricing.play_reservation_rule_id || "",
      duration: pricing.duration || "",
      price: pricing.price || "",
      is_active: pricing.is_active,
      branch_id: pricing?.PlayReservationRule?.branch_id || "",
    });
  }, [pricing]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
      id: pricing.id,
    };
    console.log(payload);
    try {
      await api.put(
        `play/pricing/extra-hours-pricing?id=${pricing.id}`,
        payload
      );
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // handle error (show toast, etc)
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pricing</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="branch_id"
            control={form.control}
            rules={{ required: "Branch is required" }}
            render={({ field, fieldState }) => (
              <SelectBranch
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                label="Branch"
              />
            )}
          />
          <Controller
            name="play_reservation_rule_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <ReservationRuleSelectInput
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                branch_id={form.watch("branch_id")}
              />
            )}
          />
          <div>
            <Label htmlFor="duration">Duration (min)</Label>
            <Input
              id="duration"
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              placeholder="Enter duration"
            />
            {form.formState.errors.duration && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.duration.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...form.register("price", { valueAsNumber: true })}
              placeholder="Enter price"
            />
            {form.formState.errors.price && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default EditExtraPricingDialog;
