"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import WebhookForm from "./web-hook-create-form";
export default function CreateWebhookDialog({ onCreated }) {
  const [open, setOpen] = useState(false);

  // Optionally, handle close on success
  const handleSuccess = (webhook) => {
    setOpen(false);
    if (onCreated) onCreated(webhook);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Webhook</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Fill out the details below to add a new webhook integration.
          </DialogDescription>
        </DialogHeader>
        <WebhookForm onSubmitSuccess={handleSuccess} />
        {/* Optional: Add a close button */}
      </DialogContent>
    </Dialog>
  );
}
