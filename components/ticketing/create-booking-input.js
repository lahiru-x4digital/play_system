import React, { useEffect, useState } from "react";
import SelectBranch from "../common/selectBranch";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { bookingService } from "@/services/booking.service";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import GenerateTimeSlots, { TimeSlotSelector } from "./GenerateTimeSlots";
import AnimatedRuleCard from "./AnimatedRuleCard";
import { Input } from "../ui/input";
import AddToCart from "./AddToCart";
import { Button } from "../ui/button";
import CartItem from "./CartItem";
import AdditionalProductSelect from "../booking/AdditionalProductSelect";
import { set } from "lodash";
import { Trash } from "lucide-react";
import PaymentInput from "../common/PaymentInput";
import { useIsAdmin, useIsUser } from "@/lib/getuserData";

export default function CreateBookingInput() {
  const { control, watch, setValue } = useFormContext();
  const firstName = watch("first_name"); // Get first_name from parent form
  const isUser = useIsUser();
  const isAdmin = useIsAdmin();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [kidsCount, setKidsCount] = useState(1); // Default to 1 kid
  const [adultsCount, setAdultsCount] = useState(1); // Default to 1 adult
  const [kids, setKids] = useState([{ name: "", birthday: "" }]); // Default kid with empty name and birthday
  const [adults, setAdults] = useState([{ name: firstName || "" }]); // Default name from first_name
  const {
    fields: additionalProducts,
    append: appendAdditionalProduct,
    remove: removeAdditionalProduct,
  } = useFieldArray({
    control,
    name: "additional_products",
  });
  const [selectedAdditionalProduct, setSelectedAdditionalProduct] =
    useState(null);

  const { append } = useFieldArray({
    control,
    name: "customer_types",
  });
  console.log("customer_types", watch("customer_types"));
  //check is ADULT exist in customer_types
  // const adultsAdded = watch("customer_types").some(
  //   (item) => item.type === "ADULT"
  // );
  // console.log("adultsAdded", adultsAdded);
  // Update adult name if first_name changes
  useEffect(() => {
    setAdults((prev) => {
      const updated = [...prev];
      if (updated.length > 0) updated[0].name = firstName || "";
      return updated;
    });
  }, [firstName]);

  const handleKidChange = (index, field, value) => {
    const updatedKids = [...kids];
    updatedKids[index] = { ...updatedKids[index], [field]: value };
    setKids(updatedKids);
  };

  const addKid = () => {
    if (kids.length < kidsCount) {
      setKids([...kids, { name: "", birthday: "" }]);
    } else if (kids.length > kidsCount) {
      setKids(kids.slice(0, kidsCount));
    }
  };

  const removeKid = (index) => {
    const updatedKids = [...kids];
    updatedKids.splice(index, 1);
    setKids(updatedKids);
    setKidsCount(kidsCount - 1);
  };

  const handleAdultChange = (index, field, value) => {
    const updatedAdults = [...adults];
    updatedAdults[index] = { ...updatedAdults[index], [field]: value };
    setAdults(updatedAdults);
  };

  const addAdult = () => {
    if (adults.length < adultsCount) {
      setAdults([...adults, { name: "" }]);
    } else if (adults.length > adultsCount) {
      setAdults(adults.slice(0, adultsCount));
    }
  };

  const removeAdult = (index) => {
    const updatedAdults = [...adults];
    updatedAdults.splice(index, 1);
    setAdults(updatedAdults);
    setAdultsCount(adultsCount - 1);
  };

  React.useEffect(() => {
    addKid();
  }, [kidsCount]);

  // React.useEffect(() => {
  //   addAdult();
  // }, [adultsCount]);
  // //!
  const branchId = watch("branch_id");
  const selectedDate = watch("date");

  const fetchRules = async (branch_id, selectedDate) => {
    const params = {
      branch_id: branchId,
      date: selectedDate,
    };
    if (branch_id) {
      params.branch_id = branch_id;
    }
    if (selectedDate) {
      params.date = selectedDate;
    }
    setLoading(true);
    try {
      const { success, data } = await bookingService.getReservationRules(
        params
      );
      if (success) {
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch reservation rules:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isUser && branchId && selectedDate) {
      fetchRules(branchId, selectedDate);
    } else if (isAdmin && branchId && selectedDate) {
      fetchRules(branchId, selectedDate);
    }
  }, [branchId, selectedDate, isUser, isAdmin]);

  const handleAddToCart = (cartItem) => {
    append({
      rule_id: cartItem.rule_id,
      price: cartItem.price,
      customers: cartItem.customers,
      rule_name: cartItem.rule_name,
    });
  };
  //total price customer_types.reducer with customers.length
  const subTotalPrice = watch("customer_types").reduce((acc, curr) => {
    const customersCount = curr.customers.length;
    return acc + parseFloat(curr.price) * customersCount;
  }, 0);
  useEffect(() => {
    setValue("amount", subTotalPrice);
  }, [subTotalPrice]);

  return (
    <div className="">
      <h1 className="text-2xl font-bold">Create Booking</h1>

      <div className=" flex items-center gap-2 ">
        <Controller
          name="branch_id"
          control={control}
          rules={{ required: "Branch is required" }}
          render={({ field, fieldState }) => (
            <SelectBranch
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setSelectedRule(null);
              }}
              error={fieldState.error?.message}
              label="Branch"
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{ required: "Date is required" }}
          render={({ field, fieldState }) => (
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                {...field}
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
          <span className="text-muted-foreground">
            Loading availability rules...
          </span>
        </div>
      ) : (
        <div className="">
          <div className="flex flex-row flex-wrap gap-2">
            {rules.map((rule, i) => (
              <div className="min-w-24 ">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <AnimatedRuleCard
                    rule={rule}
                    onRuleSelect={setSelectedRule}
                    selectedRule={selectedRule}
                  />
                </motion.div>
              </div>
            ))}
          </div>

          <CartItem />
          {selectedRule && (
            <div className="p-2 border my-2 rounded-lg bg-white">
              {/* Kids Section */}
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium">
                  Number of Kids
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setKidsCount(Math.max(1, kidsCount - 1))}
                  className="px-2"
                  aria-label="Decrease kids"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={kidsCount}
                  onChange={(e) =>
                    setKidsCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center"
                  style={{ textAlign: "center" }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setKidsCount(kidsCount + 1)}
                  className="px-2"
                  aria-label="Increase kids"
                >
                  +
                </Button>
              </div>
              <div className="">
                {kids.map((kid, index) => (
                  <div key={index} className="p-2 rounded-lg ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-medium">
                          Name
                        </label>
                        <Input
                          type="text"
                          value={kid.name}
                          onChange={(e) =>
                            handleKidChange(index, "name", e.target.value)
                          }
                          placeholder="Enter name"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-medium ">
                          Birthday
                        </label>
                        <Input
                          type="date"
                          value={kid.birthday}
                          onChange={(e) =>
                            handleKidChange(index, "birthday", e.target.value)
                          }
                          required
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeKid(index)}
                            className="text-red-500 cursor-pointer"
                            aria-label="Remove kid"
                          >
                            <Trash />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRule && (
            <div className="flex gap-2 items-baseline">
              <TimeSlotSelector
                selectedSlot={selectedSlot}
                onSlotSelect={(slot) => {
                  setSelectedSlot(slot);
                }}
                rule={selectedRule || []}
                selectedDate={selectedDate}
                key={selectedRule?.id || "no-rule"}
                kidsCount={kidsCount}
              />
              <Button
                onClick={() => {
                  // Reset customer_types before adding new items

                  // Add kids
                  append({
                    rule_id: selectedRule.id,
                    type: "KID",
                    customers: kids,
                    rule_name: selectedRule.name,
                    price: Number(selectedRule.price),
                    start_hour: selectedSlot.start_hour,
                    start_min: selectedSlot.start_min,
                    end_hour: selectedSlot.end_hour,
                    end_min: selectedSlot.end_min,
                  });
                  console.log("customer_types", watch("customer_types"));

                  // // Add adults only once globally
                  // if (!adultsAdded) {
                  //   append({
                  //     type: "ADULT",
                  //     customers: adults,
                  //     price: 0,
                  //   });
                  // }
                  setKids([{ name: "", birthday: "" }]);
                  // Reset selected slot and rule
                  setSelectedSlot(null);
                  setSelectedRule(null);
                }}
                disabled={
                  !selectedSlot ||
                  kids.some((kid) => !kid.name || kid.name.trim() === "")
                }
              >
                Add to Cart
              </Button>
            </div>
          )}
          <div className="flex gap-4 items-end justify-between mt-6 p-4 bg-gray-50 rounded-lg">
            <PaymentInput />
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Total Price
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {subTotalPrice}
              </div>
            </div>
          </div>
          {/* <div className="mt-2 flex items-end gap-2">
            <AdditionalProductSelect
              value={selectedAdditionalProduct}
              onChange={(value) =>
                setSelectedAdditionalProduct({ ...value, qty: 1 })
              }
              branchId={branchId}
            />
            <Input
              type="number"
              min={0}
              onChange={(e) =>
                setSelectedAdditionalProduct({
                  ...selectedAdditionalProduct,
                  qty: Number(e.target.value),
                })
              }
              value={selectedAdditionalProduct?.qty || ""}
              placeholder="0"
              className="border rounded w-24 px-2 py-1 focus:ring-2"
              onMouseWheel={(e) => e.target.blur()}
            />
            <Button
              type="button"
              onClick={() => {
                if (selectedAdditionalProduct?.id) {
                  appendAdditionalProduct({ ...selectedAdditionalProduct });
                  setSelectedAdditionalProduct(null);
                }
              }}
              className="ml-2"
            >
              Add Product
            </Button>
          </div> */}
          <div className="mt-4 space-y-3">
            {additionalProducts.map((item, index) => {
              const total = item.price * item.qty;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h5>
                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                      <span>Price: {item.price}</span>
                      <span>Qty: {item.qty}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdditionalProduct(index)}
                      className="flex items-center gap-1 px-2 py-1 border rounded text-sm text-red-600 border-red-300 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-indigo-600">
                      {total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
