import React, { useEffect } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import useGetProducts from "@/hooks/useGetProducts";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

export default function AdditionalProductSelect({ value, onChange, branchId }) {
  const { productsList, productsListLoading, productsListRefresh } =
    useGetProducts();

  useEffect(() => {
    productsListRefresh({ branch_id: branchId });
  }, [branchId]);

  const handleValueChange = (val) => {
    const selectedItem = productsList.find((item) => String(item.id) === val);
    if (selectedItem) {
      onChange({
        id: selectedItem.id,
        price: selectedItem.price,
        name: selectedItem.name,
      });
    }
  };

  return (
    <div className="w-full">
      <Label className="text-sm font-medium text-gray-900 mb-2 block">
        Additional Product
      </Label>
      {productsListLoading ? (
        <Skeleton className="h-10 w-full rounded" />
      ) : (
        <Select
          value={value?.id !== undefined ? String(value.id) : ""}
          onValueChange={handleValueChange}
          disabled={productsListLoading}
        >
          <SelectTrigger className="w-full border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-primary">
            <SelectValue placeholder="Select Additional Product" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            {productsList.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm">
                No products available
              </div>
            ) : (
              productsList.map((product) => (
                <SelectItem
                  key={product.id}
                  value={String(product.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {product.price}
                  </Badge>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
