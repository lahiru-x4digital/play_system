"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useGetplayCustomerType from "@/hooks/useGetplayCustomerType";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAxiosPost } from "@/hooks/useAxiosPost";

const formSchema = z.object({
  customerType: z.string().min(1, "Customer type is required"),
  minutes: z.number({ invalid_type_error: "Minutes is required" }).min(1, "Minutes must be at least 1"),
  qty: z.number({ invalid_type_error: "Quantity is required" }).min(1, "Quantity must be at least 1"),
});

export function GeneratorDialog() {
  const [open, setOpen] = useState(false);
  const { customerTypes ,customerTypesLoading,} = useGetplayCustomerType({ open });
  const {postHandler,postHandlerloading,postHandlerError}=useAxiosPost()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerType: "",
      minutes: "",
      qty: "",
    },
  });
  console.log(form.formState.errors)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          // handle form submission here
          console.log(data)
          // try {
          //   await postHandler(data,"generate-code")

          // } catch (error) {
            
          // }
        })}
        className="space-y-4"
      >
        <DialogTrigger asChild>
          <Button>Barcode Generator</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Barcode</DialogTitle>
            <DialogDescription>
              Fill the form and click generate.
            </DialogDescription>
          </DialogHeader>
          {/* Customer Type */}
          <div>
            <Label htmlFor="customerType">Customer Type</Label>
            <Select
              value={form.watch("customerType")}
              onValueChange={(val) => form.setValue("customerType", val)}
            >
              <SelectTrigger id="customerType">
                <SelectValue placeholder="Select customer type" />
              </SelectTrigger>
              <SelectContent>
                {customerTypes?.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.customerType && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.customerType.message}
              </p>
            )}
          </div>
          {/* Minutes */}
          <div>
            <Label htmlFor="minutes">Minutes</Label>
            <Input
              id="minutes"
              type="number"
              {...form.register("minutes", { valueAsNumber: true })}
              placeholder="Enter minutes"
            />
            {form.formState.errors.minutes && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.minutes.message}
              </p>
            )}
          </div>
          {/* Quantity */}
          <div>
            <Label htmlFor="qty">Quantity</Label>
            <Input
              id="qty"
              type="number"
              {...form.register("qty", { valueAsNumber: true })}
              placeholder="Enter quantity"
            />
            {form.formState.errors.qty && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.qty.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Generate</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
