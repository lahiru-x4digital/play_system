import React from "react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function CartItem() {
  const { watch, setValue } = useFormContext();
  const customerTypes = watch("customer_types") || [];
  // console.log(customerTypes);
  if (customerTypes.length === 0) return null;

  const removeCustomerType = (indexToRemove) => {
    const updated = customerTypes.filter((_, index) => index !== indexToRemove);
    setValue("customer_types", updated);
  };

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">Cart Items</h1>
      <div className="space-y-4">
        {customerTypes.map((customerType, index) => {
          const isKid = customerType.type === "KID";
          const price = isKid
            ? (parseFloat(customerType.price) || 0) *
              (customerType.customers?.length || 0)
            : 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">
                  {isKid ? customerType.rule_name : "Adult"}
                </h2>
                {
                  <span className="text-sm ">
                    Time : - {customerType.start_time} - {customerType.end_time}
                  </span>
                }
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isKid ? "default" : "secondary"}
                    className="px-3 py-1"
                  >
                    {isKid ? `LKR ${price.toFixed(2)}` : "Free"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeCustomerType(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Customer details */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {customerType.customers.map((customer, customerIndex) => (
                  <div
                    key={customerIndex}
                    className="text-sm border-b last:border-b-0 pb-1"
                  >
                    {isKid ? (
                      <>
                        <span className="font-medium">
                          {customer.name || "-"}
                        </span>{" "}
                        <span className="text-gray-500">
                          (Birthday: {customer.birthday || "-"})
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">
                        {customer.name || "-"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
