"use client";
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomerTypeSelect from "@/components/common/CustomerTypeSelectInput";
import api from "@/services/api";

const formSchema = z.object({
  play_customer_type_id: z.number().min(1, "Customer type is required"),
  duration: z.number({ invalid_type_error: "Duration is required" }).min(1, "Duration must be at least 1"),
  price: z.number({ invalid_type_error: "Price is required" }).min(0, "Price must be at least 0"),
  is_active: z.boolean().optional(),
});

const CreatePricingDialog = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      play_customer_type_id: undefined,
      duration: undefined,
      price: undefined,
      is_active: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      await api.post("play/pricing", data);
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // handle error (show toast, etc)
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Pricing</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Pricing</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="play_customer_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <CustomerTypeSelect
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                open={open}
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
          <Button type="submit" className="w-full">Create</Button>
        </form>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePricingDialog;