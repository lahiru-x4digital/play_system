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

/* helpers -------------------------------------------------------------- */
const toSelect = (arr = []) =>
  arr.map((s) => ({ value: s.value, label: s.name }));

export default function WebhookForm({ onSubmitSuccess }) {
  /* RHF ---------------------------------------------------------------- */
  const form = useForm({
    resolver: zodResolver(webhookSchema),
    defaultValues: { name: "", url: "", category: "", subCategories: [] },
    mode: "all",
  });

  const { control, handleSubmit, watch, formState } = form;
  const { isSubmitting } = formState;

  /* dynamic sub-category list ----------------------------------------- */
  const category = watch("category");
  const subOptions =
    webhookCategories
      .find((c) => c.mainCategory === category)
      ?.subCategories.map((s) => ({ value: s.Value, label: s.name })) ?? [];

  /* submit ------------------------------------------------------------- */
  const onSubmit = async (data) => {
    try {
      const response = await api.post("/webhook", data);
      onSubmitSuccess?.(response.data);
    } catch (err) {
      console.error("Error saving webhook:", err);
    }
  };

  /* UI ----------------------------------------------------------------- */
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-lg space-y-6 py-6"
        noValidate
      >
        {/* ── Name + URL (responsive grid) ───────────────────────────── */}
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

        {/* ── Category (single) ─────────────────────────────────────── */}
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

        {/* ── Sub-categories (multi) ────────────────────────────────── */}
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
                    value={toSelect(field.value)}
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

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Webhook"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
