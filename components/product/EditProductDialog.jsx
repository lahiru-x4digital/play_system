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
import SelectBranch from "../common/selectBranch";
import useSessionUser, { useIsAdmin } from "@/lib/getuserData";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number({ invalid_type_error: "Price is required" }).min(0, "Price must be at least 0"),
 branch_id: z.number().optional(),
});

const EditProductDialog = ({ product = {}, onSuccess, open, setOpen }) => {
  const isAdmin = useIsAdmin();
  const user = useSessionUser();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name || '',
      price: product.price || '',
      branch_id: product.branch_id || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      name: product.name || '',
      price: product.price || '',
      branch_id: product.branch_id || '',
    });
  }, [product]);

  const onSubmit = async (data) => {
    const payload={
      ...data,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
    }
    try {
      await api.put(`play/pricing/product?id=${product.id}`, payload);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // handle error (show toast, etc)
      console.error(error);
    }
  };
//form error state
const {errors}=form.formState
console.log(errors)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
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
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              {...form.register("name")}
              placeholder="Enter name"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.name.message}
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
          <Button type="submit" className="w-full">Save</Button>
        </form>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;