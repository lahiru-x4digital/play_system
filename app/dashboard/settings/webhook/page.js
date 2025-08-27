"use client";
import React, { useEffect, useState } from "react";
import CreateWebhookDialog from "@/components/webhook/CreateWebhookDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import EditWebhookDialog from "@/components/webhook/EditWebhookDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function WebhookSettingsPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editWebhook, setEditWebhook] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState(null);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch webhooks
  const fetchWebhooks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/webhook`, {
        params: {
          page: currentPage,
          limit: pageSize,
          category: 'Play'
        }
      });
      
      const data = response.data;
      setWebhooks(data.data || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError("Error loading webhooks");
      console.error("Fetch webhooks error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  useEffect(() => {
    fetchWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]); // fetchWebhooks is intentionally not in deps as it uses state setters

  // After create/edit
  const handleSuccess = () => {
    setEditOpen(false);
    setEditWebhook(null);
    fetchWebhooks();
  };

  const handleUpdated = () => {
    setEditOpen(false);
    setEditWebhook(null);
    fetchWebhooks();
  };

  const handleDeleteClick = (webhook) => {
    setWebhookToDelete(webhook);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!webhookToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/webhook/${webhookToDelete.id}`);

      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
      fetchWebhooks();
    } catch (error) {
      setError("Error deleting webhook");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit dialog
  const handleEdit = (webhook) => {
    console.log(webhook);
    setEditWebhook(webhook);
    setEditOpen(true);
  };
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold text-gray-900">Webhook Integrations</h2>
      <CreateWebhookDialog onCreated={handleSuccess} />
    </div>
  
    {loading && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading webhooks...
      </div>
    )}
  
    {error && (
      <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
        {error}
      </div>
    )}
  
    {!loading && webhooks.length === 0 && (
      <div className="text-sm text-muted-foreground">No webhooks found.</div>
    )}
  
    <ul className="divide-y border rounded-md mt-4 bg-white shadow-sm">
      {webhooks.map((webhook) => (
        <li
          key={webhook.id}
          className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between group"
        >
          <div className="flex-1 space-y-1">
            <p className="font-medium text-base text-gray-900">{webhook.name}</p>
  
            {(webhook.category || webhook.subCategories.length > 0) && (
              <div className="text-sm space-y-1">
                {webhook.category && (
                  <div className="text-gray-700 font-medium">
                    {webhook.category}
                  </div>
                )}
                {webhook.subCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {webhook.subCategories.map((sc,index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full border border-gray-200"
                      >
                        {sc.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
  
            <p className="text-sm text-muted-foreground truncate">
              {webhook.url}
            </p>
          </div>
  
          <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEdit(webhook)}
              aria-label="Edit"
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDeleteClick(webhook)}
              aria-label="Delete"
              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  

      {webhooks.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            total={totalItems}
          />
        </div>
      )}

      {/* Edit dialog (re-using your WebhookForm in a dialog) */}
      {editOpen && (
        <EditWebhookDialog
          webhook={editWebhook}
          open={editOpen}
          setOpen={setEditOpen}
          onUpdated={handleUpdated}
        />
      )}

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Webhook"
        description={`Are you sure you want to delete the webhook "${webhookToDelete?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        confirmVariant="destructive"
      />
    </div>
  );
}
