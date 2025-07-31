import React, { useEffect } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import useGetProducts from '@/hooks/useGetProducts'

export default function AdditionalProductSelect({ value, onChange, branchId }) {
    const { productsList,productsListLoading,productsListRefresh} = useGetProducts()
  
    useEffect(() => {
        productsListRefresh({ branch_id: branchId})
    }, [branchId])

    const handleValueChange = (val) => {
        const selectedItem = productsList.find(item => String(item.id) === val);
        if (selectedItem) {
            onChange({
                id: selectedItem.id,
                price: selectedItem.price,
                name: selectedItem.name
            });
        }
    };

    return (
        <div style={{ width: "250px", maxWidth: "250px" }}>
            <Label className='text-sm font-medium text-gray-900'>Additional Product</Label>
            <Select
                value={value?.id !== undefined ? String(value.id) : ""}
                onValueChange={handleValueChange}
                disabled={productsListLoading}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Additional Product" />
                </SelectTrigger>
                <SelectContent>
                    {productsList.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                            {`min ${product.name} price ${product.price}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
