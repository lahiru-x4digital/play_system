'use client'
import useGetplayCustomerType from '@/hooks/useGetplayCustomerType'
import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAxiosPost } from "@/hooks/useAxiosPost";
import { Pencil } from 'lucide-react';
import CustomerTypeEditDialog from '@/components/customer-types/CustomerTypeEditDialog';
import { useAxiosPut } from '@/hooks/useAxiosPut';

export default function page() {
    const { customerTypes, customerTypesLoading, customerTypesRefresh } = useGetplayCustomerType(true)
    const { postHandler, postHandlerloading } = useAxiosPost();
    const { putHandler } = useAxiosPut();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    
    // Edit dialog state
    const [editingCustomerType, setEditingCustomerType] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await postHandler("customer-type", { name });
            setOpen(false);
            setName("");
            customerTypesRefresh();
        } catch (err) {
            setError("Failed to create customer type");
        }
    };

    const handleEditCustomerType = async (updatedCustomerType) => {
        try {
            await putHandler(`customer-type`, { 
                name: updatedCustomerType.name,
                id: updatedCustomerType.id
            });
            setIsEditDialogOpen(false);
            customerTypesRefresh();
        } catch (err) {
            console.error("Failed to update customer type", err);
        }
    };

    if (customerTypesLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Customer Types</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Customer Type</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Customer Type</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter customer type name"
                                    required
                                />
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={postHandlerloading}>
                                    {postHandlerloading ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customerTypes?.map((type) => (
                            <TableRow key={type.id}>
                                <TableCell className="font-medium">{type.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            setEditingCustomerType(type);
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <CustomerTypeEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                customerType={editingCustomerType}
                onSave={handleEditCustomerType}
                loading={postHandlerloading}
            />
        </div>
    )
}
