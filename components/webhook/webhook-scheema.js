"use client";
import { z } from "zod";

export const webhookCategories = [
  {
    mainCategory: "Play",
    subCategories: [
      {
        name: "Create",
        Value: "CREATE",
      },
      {
        name: "Update",
        Value: "UPDATE",
      },
    
    ],
  },
];

export const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL required"),
  category: z.string(),
  subCategories: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .min(1, "At least one subcategory is required"),
});
