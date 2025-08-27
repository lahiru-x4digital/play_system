"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectRS from "react-select";

import { webhookSchema, webhookCategories } from "./webhook-scheema";
import api from "@/services/api";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- helpers -------------------------------------------------- */
const dbToSelect = (subs = []) =>
  subs.map((s) => ({ value: s.value, label: s.name }));

const defaults = (hook) => ({
  name: hook?.name ?? "",
  url: hook?.url ?? "",
  category: hook?.category ?? "",
  subCategories: hook?.subCategories ?? [],
});

/* -------------------------------------------------------------------- */
export default function WebhookForm({ initialData = null, onSubmitSuccess }) {
  const isEdit = Boolean(initialData);

  const form = useForm({
    resolver: zodResolver(webhookSchema),
    defaultValues: defaults(initialData),
    mode: "all",
  });

  const { control, handleSubmit, watch, formState } = form;
  const { errors, isSubmitting } = formState;

  /* dynamic sub-category list */
  const category = watch("category");
  const subOptions =
    webhookCategories
      .find((c) => c.mainCategory === category)
      ?.subCategories.map((s) => ({ value: s.Value, label: s.name })) ?? [];

  /* submit */
  const onSubmit = async (data) => {
    try {
      let response;
      if (isEdit) {
        response = await api.put(`/webhook/${initialData.id}`, data);
      } else {
        response = await api.post("/webhook", data);
      }
      onSubmitSuccess?.(response.data);
    } catch (err) {
      console.error(`${isEdit ? 'PUT' : 'POST'} webhook failed:`, err);
    }
  };

  /* ---------------------------- UI ----------------------------------- */
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
        {/* name + url -------------------------------------------------- */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Webhook name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/webhook"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* category ---------------------------------------------------- */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {webhookCategories.map((c) => (
                      <SelectItem key={c.mainCategory} value={c.mainCategory}>
                        {c.mainCategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* sub-categories (multi) ------------------------------------- */}
        {category && (
          <FormField
            control={control}
            name="subCategories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-categories</FormLabel>
                <FormControl>
                  <SelectRS
                    isMulti
                    options={subOptions}
                    value={dbToSelect(field.value)}
                    onChange={(vals) =>
                      field.onChange(
                        vals.map((v) => ({ name: v.label, value: v.value }))
                      )
                    }
                    classNamePrefix="rs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* actions ----------------------------------------------------- */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Updating…"
                : "Saving…"
              : isEdit
              ? "Update"
              : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
