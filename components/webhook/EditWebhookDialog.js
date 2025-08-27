"use client";
import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import WebhookForm from "./web-hook-edit-form";

/**
 * Modal for creating / editing a webhook
 */
function EditWebhookDialog({ webhook, open, setOpen, onUpdated }) {
  const handleSuccess = (updated) => {
    setOpen(false);
    onUpdated?.(updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {webhook ? "Edit Webhook" : "Create Webhook"}
          </DialogTitle>
          <DialogDescription>
            {webhook
              ? "Change any field and press Update."
              : "Fill the form below to register a new webhook."}
          </DialogDescription>
        </DialogHeader>

        {webhook !== undefined && (
          <WebhookForm
            initialData={webhook ?? null}
            onSubmitSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

EditWebhookDialog.propTypes = {
  webhook: PropTypes.object, // may be null during "create"
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  onUpdated: PropTypes.func,
};

export default memo(EditWebhookDialog);
