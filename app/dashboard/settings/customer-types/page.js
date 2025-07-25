'use client'
import useGetplayCustomerType from '@/hooks/useGetplayCustomerType'
import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAxiosPost } from "@/hooks/useAxiosPost";
import useGetBrandList from '@/hooks/useGetBrandList';

export default function page() {
    const {customerTypes,customerTypesLoading,customerTypesRefresh}=useGetplayCustomerType(true)
    const { postHandler, postHandlerloading } = useAxiosPost();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await postHandler("customer-type", { name });
            setOpen(false);
            setName("");
            customerTypesRefresh()
            // Optionally, refetch customer types here if needed
        } catch (err) {
            setError("Failed to create customer type");
        }
    };


    if (customerTypesLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="rounded-md border">
            {/* Add Dialog Trigger Button */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="m-4">Add Customer Type</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Customer Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <DialogFooter>
                            <Button type="submit" disabled={postHandlerloading}>
                                {postHandlerloading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Table>
            
                <TableHeader>
                    <TableRow>
                        {/* <TableHead>ID</TableHead> */}
                        <TableHead>Name</TableHead>
                        <TableHead>Created Date</TableHead>
                      
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(customerTypes) && customerTypes.length > 0 ? (
                        customerTypes.map((type) => (
                            <TableRow key={type.id}>
                                {/* <TableCell>{type.id}</TableCell> */}
                                <TableCell>{type.name}</TableCell>
                                <TableCell>{new Date(type.created_date).toLocaleString()}</TableCell>
                                {/* <TableCell>{new Date(type.updated_date).toLocaleString()}</TableCell> */}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} style={{ textAlign: 'center' }}>No customer types found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
