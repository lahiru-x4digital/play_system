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
  play_customer_type_id: z.number().min(1, "Customer type is required"),
  minutes: z.number({ invalid_type_error: "Minutes is required" }).min(1, "Minutes must be at least 1"),
  qty: z.number({ invalid_type_error: "Quantity is required" }).min(1, "Quantity must be at least 1"),
});

export function GeneratorDialog() {
  const [open, setOpen] = useState(false);
  const { customerTypes   ,customerTypesLoading,} = useGetplayCustomerType(open);
  const {postHandler,postHandlerloading,postHandlerError}=useAxiosPost()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      play_customer_type_id: undefined,
      minutes: undefined,
      qty: undefined,
    },
  });
 
  const onSubmit = async (data) => {
   
    try {
      await postHandler("generate-code",data)
    } catch (error) {
      console.log(error)
    }}
  return (
    <Dialog open={open} onOpenChange={setOpen}>
     
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
          <div>
            <Label htmlFor="customerType">Customer Type</Label>
            <Select
              value={form.watch("play_customer_type_id")}
              onValueChange={(val) => form.setValue("play_customer_type_id", Number(val))}
            >
              <SelectTrigger id="customerType">
                <SelectValue placeholder="Select customer type" />
              </SelectTrigger>
              <SelectContent>
                {customerTypes?.map((type) => (
                  <SelectItem key={type.id} value={Number(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.play_customer_type_id && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.play_customer_type_id.message}
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
          <Button className={'cursor-pointer'} type="submit">Generate</Button>
          </form>
          <DialogFooter>
          </DialogFooter>
        </DialogContent>
    
    </Dialog>
  );
}
