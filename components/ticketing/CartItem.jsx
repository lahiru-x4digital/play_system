import React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CartItem() {
  const { watch, setValue } = useFormContext();
  const customerTypes = watch("customer_types") || [];

  // Don't render if empty
  if (customerTypes.length === 0) return null;

  const removeCustomerType = (indexToRemove) => {
    const updated = customerTypes.filter((_, index) => index !== indexToRemove);
    setValue("customer_types", updated);
  };

  return (
    <div className="flex flex-wrap gap-3 ">
      <h1 className="text-xl font-bold w-full">Cart Items</h1>
      {customerTypes.map((customerType, index) => {
        const isKid = customerType.type === "KID";
        const price = isKid
          ? (parseFloat(customerType.price) || 0) *
            (customerType.customers?.length || 0)
          : 0;
        return (
          <div key={index} className="w-96">
            <Card className="p-2">
              <CardHeader className="pb-2 flex items-center justify-between gap-2">
                <CardTitle className="text-base truncate pr-2">
                  {isKid ? customerType.rule_name : "Adult"}
                </CardTitle>
                <span>
                  Price -{" "}
                  <Badge variant="secondary">
                    {isKid ? `${price}` : "Free"}
                  </Badge>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                  onClick={() => removeCustomerType(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {customerType.customers.map((customer, customerIndex) => (
                  <div
                    key={customerIndex}
                    className="flex flex-col bg-muted/30 rounded text-sm px-2 py-1"
                  >
                    <span className="font-medium">
                      Name: {customer.name || "-"}
                    </span>
                    {isKid && (
                      <span className="text-muted-foreground">
                        Birthday: {customer.birthday || "-"}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
