import React from "react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PaymentInput from "../common/PaymentInput";

export default function CartItem() {
  const { watch, setValue, formState } = useFormContext();
  const customerTypes = watch("customer_types") || [];
  // console.log(customerTypes);
  if (customerTypes.length === 0) return null;

  const removeCustomerType = (indexToRemove) => {
    const updated = customerTypes.filter((_, index) => index !== indexToRemove);
    setValue("customer_types", updated);
  };
  const totalPayment = watch("payments")
    ?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    .toFixed(2);

  // Get payments error
  const paymentsError = formState.errors?.payments?.root?.message;
  console.log("paymentsError", formState.errors);
  return (
    <div className="w-full">
      {/* <h1 className="text-xl font-bold">Cart Items</h1> */}
      <table className="min-w-full bg-white rounded-2xl shadow-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Package</th>
            <th className="px-4 py-2 text-left">Kids</th>
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {customerTypes.map((customerType, index) => {
            const isKid = customerType.type === "KID";
            const price = isKid
              ? (parseFloat(customerType.price) || 0) *
                (customerType.customers?.length || 0)
              : 0;
            const time = `${String(customerType.start_hour).padStart(
              2,
              "0"
            )}:${String(customerType.start_min).padStart(2, "0")} - ${String(
              customerType.end_hour
            ).padStart(2, "0")}:${String(customerType.end_min).padStart(
              2,
              "0"
            )}`;
            return (
              <tr key={index} className="border-b last:border-b-0">
                <td className="px-4 py-2 font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    onClick={() => removeCustomerType(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isKid ? customerType.rule_name : "Adult"}
                </td>
                <td className="px-4 py-2">
                  {isKid ? (
                    <div>
                      <div className="font-bold mb-1">
                        {customerType.customers.length} Kid(s)
                      </div>
                      <ul className="list-disc pl-4">
                        {customerType.customers.map((customer, i) => (
                          <li key={i}>
                            <span className="font-medium">
                              {customer.name || "-"}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              (Birthday: {customer.birthday || "-"})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold mb-1">
                        {customerType.customers.length} Adult(s)
                      </div>
                      <ul className="list-disc pl-4">
                        {customerType.customers.map((customer, i) => (
                          <li key={i}>
                            <span className="font-medium">
                              {customer.name || "-"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{time}</td>
                <td className="px-4 py-2 text-right align-middle">
                  {isKid ? `${price.toFixed(2)}` : "Free"}
                </td>
              </tr>
            );
          })}
          {/* Total row */}
          <tr>
            <td colSpan={3} className="font-bold text-right align-middle">
              Sub Total&nbsp;
            </td>
            <td colSpan={4} className="px-4  font-bold text-right align-middle">
              <span>
                {watch("amount") ? Number(watch("amount")).toFixed(2) : "0.00"}
              </span>
            </td>
          </tr>
          <tr>
            <td className={`text-right `} colSpan={3}>
              Payment Total&nbsp;
            </td>
            <td
              colSpan={1}
              className={`px-4  text-right align-middle ${
                paymentsError ? "text-red-600 font-bold" : ""
              }`}
            >
              <span>{totalPayment}</span>
            </td>
          </tr>
          <tr>
            <td className="text-right" colSpan={3}>
              Balance&nbsp;
            </td>
            <td colSpan={1} className="px-4  text-right align-middle">
              <span>{watch("amount") - totalPayment}</span>
            </td>
          </tr>
          {/* Show payments error here */}
          {paymentsError && (
            <tr>
              <td colSpan={4}>
                <div className="text-red-600 text-sm text-right">
                  {paymentsError}
                </div>
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={1}></td>
            <td colSpan={3}>
              <PaymentInput branch_id={watch("branch_id")} />
            </td>

            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
